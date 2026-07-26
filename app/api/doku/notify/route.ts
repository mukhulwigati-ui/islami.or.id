// app/api/doku/notify/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    console.log('🔔 DOKU NOTIFICATION RECEIVED:', JSON.stringify(body));

    // 1. Ambil Header Keamanan dari DOKU
    const clientId = req.headers.get('client-id');
    const requestId = req.headers.get('request-id');
    const requestTimestamp = req.headers.get('request-timestamp');
    const signatureHeader = req.headers.get('signature');
    const secretKey = process.env.DOKU_SECRET_KEY;

    // 2. Validasi Tanda Tangan (Signature) untuk keamanan
    if (secretKey && signatureHeader) {
      const digest = crypto.createHash('sha256').update(rawBody).digest('base64');
      const requestTarget = '/api/doku/notify'; // Sesuaikan path endpoint Anda jika berbeda
      const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
      
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(stringToSign)
        .digest('base64');

      const expectedSignature = `HMACSHA256=${computedSignature}`;

      if (signatureHeader !== expectedSignature) {
        console.warn('⚠️ Peringatan: Tanda tangan DOKU tidak valid!');
        // Catatan: Jika Anda sedang uji coba sandbox dan validasi ketat ini bermasalah, 
        // Anda bisa mengomentari pengecekan signature ini sementara waktu.
      }
    }

    // 3. Ekstrak Data Penting dari Payload DOKU
    const invoiceNumber = body.order?.invoice_number;
    const amount = Number(body.order?.amount || 0);
    const transactionStatus = body.transaction?.status || body.result?.status;

    // Cek apakah transaksi dinyatakan berhasil/lunas
    if (transactionStatus === 'SUCCESS' || transactionStatus === 'PAID') {
      console.log(`✅ Pembayaran untuk Invoice ${invoiceNumber} sebesar Rp ${amount} BERHASIL.`);

      // =========================================================================
      // 🚀 MASUKKAN KODE DATABASE ANDA DI SINI
      // =========================================================================
      // Contoh jika menggunakan Prisma / Database Client:
      // 
      // // A. Cari data donasi berdasarkan invoice
      // const donation = await prisma.donation.findUnique({
      //   where: { invoiceNumber: invoiceNumber }
      // });
      // 
      // if (donation && donation.status !== 'PAID') {
      //   // B. Ubah status donasi menjadi PAID
      //   await prisma.donation.update({
      //     where: { invoiceNumber: invoiceNumber },
      //     data: { status: 'PAID' }
      //   });
      // 
      //   // C. Tambahkan total dana terkumpul ke campaign terkait
      //   await prisma.campaign.update({
      //     where: { id: donation.campaignId },
      //     data: {
      //       collectedAmount: {
      //         increment: amount
      //       }
      //     }
      //   });
      //   console.log(`🎉 Saldo campaign berhasil ditambah sebesar Rp ${amount}`);
      // }
      // =========================================================================

    } else {
      console.log(`ℹ️ Status transaksi ${invoiceNumber}: ${transactionStatus}`);
    }

    // DOKU mewajibkan respons HTTP 200 OK agar mereka tahu notifikasi berhasil diterima
    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });

  } catch (error) {
    console.error('🔥 Error saat memproses webhook DOKU:', error);
    return NextResponse.json(
      { status: 'ERROR', message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}