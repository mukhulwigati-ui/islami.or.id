// app/api/doku/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import crypto from 'crypto';

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('signature') || '';
    const clientId = request.headers.get('client-id') || '';
    const requestId = request.headers.get('request-id') || '';
    const requestTimestamp = request.headers.get('request-timestamp') || '';

    const secretKey = process.env.DOKU_SECRET_KEY || '';

    // Validasi Keamanan Signature DOKU (Opsional tapi disarankan)
    if (secretKey) {
      const digest = crypto.createHash('sha256').update(rawBody).digest('base64');
      const requestTarget = '/api/doku/webhook'; // Sesuaikan jika path berbeda di production
      const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
      
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(stringToSign)
        .digest('base64');

      const expectedSignature = `HMACSHA256=${computedSignature}`;
      if (signature !== expectedSignature) {
        console.warn('⚠️ Peringatan: Tanda tangan webhook DOKU tidak valid.');
        // Anda bisa memilih untuk mengembalikan error 401 jika ingin ketat
      }
    }

    const data = JSON.parse(rawBody);
    const order = data.order;
    const transaction = data.transaction;

    const invoiceNumber = order?.invoice_number;
    const amount = Number(order?.amount || 0);
    const transactionStatus = transaction?.status; // Biasanya 'SUCCESS' atau 'FAILED'

    if (!invoiceNumber) {
      return NextResponse.json({ success: false, message: 'Invoice number tidak ditemukan.' }, { status: 400 });
    }

    console.log(`🔔 Webhook DOKU diterima untuk Invoice: ${invoiceNumber}, Status: ${transactionStatus}`);

    // 1. Cari dokumen transaksi di Sanity berdasarkan orderId (invoice_number)
    const query = `*[_type == "donationTransaction" && orderId == $orderId[0]]{_id, status, programName}`;
    const transactions = await serverClient.fetch(query, { orderId: [invoiceNumber] });

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan di database.' }, { status: 404 });
    }

    const txDoc = transactions[0];

    // Jika transaksi sudah sukses sebelumnya, abaikan agar tidak duplikat
    if (txDoc.status === 'success') {
      return NextResponse.json({ success: true, message: 'Transaksi sudah berstatus sukses sebelumnya.' });
    }

    // 2. Perbarui status transaksi di Sanity jika pembayaran sukses
    if (transactionStatus === 'SUCCESS' || data.transaction?.success === true) {
      await serverClient
        .patch(txDoc._id)
        .set({ status: 'success' })
        .commit();

      console.log(`✅ Transaksi ${invoiceNumber} berhasil diperbarui menjadi SUCCESS di Sanity.`);
      
      // (Opsional) Di sini Anda juga bisa menambahkan logika penambahan nominal ke dokumen Program/Campaign utama di Sanity.
    } else if (transactionStatus === 'FAILED') {
      await serverClient
        .patch(txDoc._id)
        .set({ status: 'failed' })
        .commit();
    }

    return NextResponse.json({ success: true, message: 'Webhook berhasil diproses.' });

  } catch (error: any) {
    console.error('🔥 Error pada Webhook DOKU:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}