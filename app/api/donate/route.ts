// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { createDokuCheckout } from '@/lib/doku';
import { createClient } from '@sanity/client';

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xqggeww8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorName, amount, programId, phone, email, fundraiserPhone } = body;

    // Bersihkan string nominal dari titik/koma/karakter lain agar menjadi angka murni
    const cleanAmount = Number(String(amount || '').replace(/[^0-9]/g, ''));

    if (!cleanAmount || cleanAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Nominal donasi tidak valid.' }, { status: 400 });
    }

    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.islami.or.id';

    // 1. Buat transaksi pembayaran di DOKU
    const dokuResponse = await createDokuCheckout({
      orderId,
      amount: cleanAmount,
      buyerName: donorName || 'Hamba Allah',
      buyerEmail: email || 'support@islami.or.id',
      buyerPhone: phone || '081225147373',
      returnUrl: `${baseUrl}/donation/success?orderId=${orderId}`,
      notifyUrl: `${baseUrl}/api/doku/webhook`,
    });

    // 2. Simpan record transaksi awal berstatus pending ke Sanity CMS dengan Reference Program
    await serverClient.create({
      _type: 'donationTransaction',
      orderId,
      donorName: donorName || 'Hamba Allah',
      donorPhone: phone || '',
      donorEmail: email || '',
      amount: cleanAmount,
      fundraiserPhone: fundraiserPhone || '',
      
      // Menyimpan programId sebagai format _reference yang valid ke Sanity
      programName: programId ? {
        _type: 'reference',
        _ref: programId,
      } : undefined,

      status: 'pending',
      paymentUrl: dokuResponse.paymentUrl,
      transactionId: String(dokuResponse.transactionId || ''),
    });

    // 3. Kembalikan respons sukses ke frontend
    return NextResponse.json({
      success: true,
      paymentUrl: dokuResponse.paymentUrl,
      orderId,
    });

  } catch (error: any) {
    console.error('🔥 Gagal membuat transaksi donasi DOKU:', error);
    return NextResponse.json({ success: false, message: error.message || 'Terjadi kesalahan server.' }, { status: 500 });
  }
}