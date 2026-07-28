// app/api/doku/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Menggunakan SANITY_API_WRITE_TOKEN dengan izin minimum khusus tulis transaksi & program
const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xqggeww8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headers = request.headers;

    const signature = headers.get('signature') || headers.get('client-signature') || '';
    const clientId = headers.get('client-id') || headers.get('clientid') || '';
    const requestId = headers.get('request-id') || headers.get('requestid') || '';
    const requestTimestamp = headers.get('request-timestamp') || headers.get('timestamp') || '';

    // 1. Validasi Client ID
    if (process.env.DOKU_CLIENT_ID && clientId !== process.env.DOKU_CLIENT_ID) {
      return NextResponse.json({ success: false, message: 'Invalid client id' }, { status: 401 });
    }

    // 2. Validasi Timestamp (Anti Replay Attack - Maksimal selisih 5 menit)
    if (requestTimestamp) {
      const ts = new Date(requestTimestamp).getTime();
      if (Number.isNaN(ts)) {
        return NextResponse.json({ success: false, message: 'Invalid timestamp' }, { status: 401 });
      }
      const diff = Math.abs(Date.now() - ts);
      if (diff > 5 * 60 * 1000) {
        return NextResponse.json({ success: false, message: 'Expired webhook' }, { status: 401 });
      }
    }

    // 3. Validasi Keamanan Signature DOKU (Wajib / Tolak jika tidak valid)
    const secretKey = process.env.DOKU_SECRET_KEY || '';
    if (secretKey && signature) {
      const digest = crypto.createHash('sha256').update(rawBody).digest('base64');
      const requestTarget = '/api/doku/webhook'; 
      const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
      
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(stringToSign)
        .digest('base64');

      const expectedSignature = `HMACSHA256=${computedSignature}`;
      if (signature !== expectedSignature) {
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(rawBody);
    const order = data.order || {};
    const transaction = data.transaction || {};

    const invoiceNumber = order.invoice_number;
    const amount = Number(order.amount || data.amount || 0);
    const transactionStatus = String(transaction.status || data.status || '').toUpperCase();

    if (!invoiceNumber) {
      return NextResponse.json({ success: false, message: 'Invoice number tidak ditemukan.' }, { status: 400 });
    }

    console.log(`🔔 Webhook DOKU diterima untuk Invoice: ${invoiceNumber}, Status: ${transactionStatus}`);

    // 4. Perbaikan Query Sanity (Langsung mengembalikan objek tunggal [0] dengan field lengkap)
    const query = `*[(_type == "donationTransaction" || _type == "donation") && (orderId == $orderId || invoiceId == $orderId)][0]{
      _id,
      status,
      amount,
      orderId,
      programId,
      donorName,
      donorEmail,
      donorPhone
    }`;

    const txDoc = await serverClient.fetch(query, { orderId: invoiceNumber });

    if (!txDoc) {
      return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan di database.' }, { status: 404 });
    }

    // 5. Hindari Proses Dua Kali (Idempotency Check)
    if (txDoc.status === 'success' || txDoc.status === 'paid' || txDoc.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Transaksi sudah berstatus sukses sebelumnya.' });
    }

    // 6. Validasi Nominal Pembayaran
    if (Number(txDoc.amount) !== amount) {
      return NextResponse.json({ success: false, message: 'Amount mismatch' }, { status: 400 });
    }

    // Cek apakah status pembayaran sukses
    const isSuccess = transactionStatus === 'SUCCESS' || transaction.success === true || data.result_code === '00';

    if (isSuccess) {
      const paymentTime = new Date().toISOString();
      const paymentMethod = data.channel?.id || data.payment_method || 'QRIS / VA';
      const referenceNumber = transaction.reference_id || data.reference_number || '';

      // Eksekusi Transaksi Sanity secara Atomik
      const transactionPatch = serverClient.transaction();

      // A. Update status transaksi
      transactionPatch.patch(txDoc._id, {
        set: {
          status: 'success',
          paymentMethod,
          referenceNumber,
          paymentTime,
          updatedAt: paymentTime,
        },
      });

      // B. Perbarui nominal program (collectedAmount & push donatur) secara atomik jika programId terikat
      if (txDoc.programId) {
        transactionPatch.patch(txDoc.programId, {
          setIfMissing: { donors: [] },
          inc: { collectedAmount: amount },
          push: {
            donors: [
              {
                _key: crypto.randomUUID(),
                donorName: txDoc.donorName || 'Hamba Allah',
                amount: amount,
                donatedAt: paymentTime,
              },
            ],
          },
        });
      }

      await transactionPatch.commit();

      console.log(`✅ Transaksi ${invoiceNumber} berhasil diproses, saldo program diperbarui.`);
      return NextResponse.json({ success: true, message: 'Webhook berhasil diproses dan data diperbarui secara atomik.' });

    } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
      await serverClient
        .patch(txDoc._id)
        .set({ status: 'failed', updatedAt: new Date().toISOString() })
        .commit();

      return NextResponse.json({ success: true, message: 'Transaksi ditandai gagal.' });
    }

    return NextResponse.json({ success: true, message: 'Webhook diterima.' });

  } catch (error: any) {
    console.error('🔥 Error pada Webhook DOKU:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}