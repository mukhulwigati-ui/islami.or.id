// app/api/doku/notify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { google } from 'googleapis';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xqggeww8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

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

    // 3. Validasi Keamanan Signature DOKU
    const secretKey = process.env.DOKU_SECRET_KEY || '';
    if (secretKey && signature) {
      const digest = crypto.createHash('sha256').update(rawBody).digest('base64');
      const requestTarget = '/api/doku/notify'; 
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

    const body = JSON.parse(rawBody);
    console.log('🔔 DOKU WEBHOOK MASUK:', JSON.stringify(body, null, 2));

    const orderId = 
      body.order?.invoice_number || 
      body.order?.order_id || 
      body.invoice_number || 
      body.orderId;

    const amount = Number(
      body.order?.amount || 
      body.amount || 
      0
    );

    const transactionStatus = String(body.transaction?.status || body.status || '').toUpperCase();
    const paymentMethod = 
      body.payment?.method || 
      body.channel?.id || 
      body.payment_channel || 
      'QRIS / Transfer';

    if (!orderId) {
      console.error('❌ ERROR: Order ID / Invoice kosong dari payload DOKU!');
      return NextResponse.json({ status: 'FAILED', message: 'Order ID not found' }, { status: 400 });
    }

    // 4. Cari data transaksi donasi berdasarkan orderId di Sanity
    const donationDoc = await sanityClient.fetch(
      `*[(_type == "donationTransaction" || _type == "donation") && (orderId == $orderId || invoiceId == $orderId)][0]{
        _id,
        status,
        amount,
        orderId,
        programName,
        donorName,
        donorPhone,
        fundraiserPhone
      }`,
      { orderId }
    );

    if (!donationDoc) {
      console.error(`❌ ERROR: Transaksi dengan Order ID "${orderId}" tidak ditemukan di Sanity!`);
      return NextResponse.json({ status: 'NOT_FOUND', message: 'Transaction not found' }, { status: 404 });
    }

    // 5. Idempotency Check
    if (donationDoc.status === 'success' || donationDoc.status === 'paid' || donationDoc.status === 'completed') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Already processed' });
    }

    // 6. Validasi Nominal Pembayaran
    if (amount > 0 && Number(donationDoc.amount) !== amount) {
      console.error(`❌ ERROR: Nominal tidak cocok! Database: ${donationDoc.amount}, Payload DOKU: ${amount}`);
      return NextResponse.json({ status: 'FAILED', message: 'Amount mismatch' }, { status: 400 });
    }

    const isSuccess = transactionStatus === 'SUCCESS' || body.transaction?.success === true || body.result_code === '00';

    if (!isSuccess) {
      await sanityClient.patch(donationDoc._id).set({ status: 'failed', updatedAt: new Date().toISOString() }).commit();
      return NextResponse.json({ status: 'SUCCESS', message: 'Transaction marked as failed' });
    }

    const paymentTime = new Date().toISOString();

    // 7. Update status transaksi menjadi success
    await sanityClient.patch(donationDoc._id).set({
      status: 'success',
      paymentMethod: paymentMethod.toUpperCase(),
      paymentTime,
      updatedAt: paymentTime,
    }).commit();

    // 8. Ambil Program ID dan Update Saldo secara Aman
    let programId = donationDoc.programName?._ref;
    if (!programId) {
      const defaultProgram = await sanityClient.fetch(`*[_type == "program"][0]{_id}`);
      if (defaultProgram) {
        programId = defaultProgram._id;
      }
    }

    let programDoc = null;
    const finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);

    if (programId) {
      programDoc = await sanityClient.fetch(`*[_id == $id][0]{_id, title, collectedAmount}`, { id: programId });
      
      if (programDoc) {
        const currentCollected = Number(programDoc.collectedAmount || 0);
        const newCollected = currentCollected + finalAmount;

        const currentDateStr = new Date().toLocaleDateString('id-ID', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });

        const newDonorEntry = {
          _key: crypto.randomUUID(),
          name: donationDoc.donorName || 'Hamba Allah',
          amount: finalAmount,
          date: currentDateStr,
        };

        // Menggunakan method .set() untuk collectedAmount dan .append() untuk menambah data ke array donors
        await sanityClient
          .patch(programId)
          .setIfMissing({ donors: [] })
          .set({ collectedAmount: newCollected })
          .append('donors', [newDonorEntry])
          .commit();

        console.log(`🎉 SUKSES! Program "${programDoc.title || programId}" bertambah Rp ${finalAmount}. Total terkumpul: Rp ${newCollected}`);
      }
    }

    // Format Tanggal & Waktu (untuk WA & Google Sheet)
    const now = new Date();
    const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = now.toLocaleDateString('id-ID', optionsDate);
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
    const fullDateTime = `${dateString} - ${timeString} WIB`;

    const donorPhone = donationDoc.donorPhone;
    const donorName = donationDoc.donorName || 'Hamba Allah';
    const programTitle = programDoc?.title || 'Program Kebaikan';
    const formattedAmount = finalAmount.toLocaleString('id-ID');
    const invoiceNo = donationDoc.orderId || orderId;
    const fundraiserRef = donationDoc.fundraiserPhone || '-';

    // 9. 🚀 OTOMATIS CATAT KE GOOGLE SHEETS
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      const rowData = [
        fullDateTime,
        invoiceNo,
        donorName,
        donorPhone || '-',
        programTitle,
        finalAmount,
        paymentMethod.toUpperCase(),
        'SUCCESS',
        fundraiserRef,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });

      console.log('📊 Berhasil mencatat data donasi ke Google Sheets!');
    } catch (sheetErr) {
      console.error('🔥 GAGAL CATAT KE GOOGLE SHEETS:', sheetErr);
    }

    // 10. 🚀 EKSEKUSI KIRIM WHATSAPP OTOMATIS KE DONATUR
    try {
      console.log('📱 MEMULAI PENGIRIMAN WA. Nomor Target:', donorPhone);

      if (donorPhone) {
        let formattedPhone = String(donorPhone).replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.slice(1);
        }

        const waMessage = `*DONASI BERHASIL DITERIMA* 🎉\n\nJazakumullah khairan, *${donorName}*.\nDonasi Anda telah berhasil kami verifikasi dengan detail berikut:\n\n📝 *No. Invoice:* ${invoiceNo}\n📌 *Program:* ${programTitle}\n💰 *Nominal:* Rp ${formattedAmount}\n💳 *Metode:* ${paymentMethod.toUpperCase()}\n⏰ *Tanggal:* ${fullDateTime}\n\nSemoga sedekah yang ditunaikan menjadi penggugur dosa, pembuka pintu rezeki, dan membawa keberkahan yang berlipat ganda untuk Anda beserta keluarga. Aamiin Yaa Rabbal 'Aalamiin.\n\n----------------------------\n*islami.or.id*\n_Salurkan kepedulian Anda secara amanah & transparan_`;

        const fonnteToken = process.env.FONNTE_TOKEN || process.env.WHATSAPP_API_TOKEN;

        const fonnteRes = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': fonnteToken || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: formattedPhone,
            message: waMessage,
            countryCode: '62',
          }),
        });

        const fonnteJson = await fonnteRes.json();
        console.log('🚀 RESPON DARI SERVER FONNTE:', JSON.stringify(fonnteJson));
      } else {
        console.log('⚠️ Nomor WhatsApp donatur kosong, pengiriman WA dilewati.');
      }
    } catch (waInnerErr) {
      console.error('🔥 TERJADI ERROR SAAT KIRIM WA:', waInnerErr);
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 CRITICAL ERROR DI WEBHOOK:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}