// app/api/donation/create/route.ts
import { NextResponse } from 'next/server';
import { createIpaymuTransaction } from '@/lib/ipaymu';
import { createClient } from '@sanity/client';

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorName, amount, programId, programTitle, phone, email } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Nominal donasi tidak valid.' }, { status: 400 });
    }

    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.islami.or.id';

    // 1. Buat transaksi di iPaymu
    const ipaymuResponse = await createIpaymuTransaction({
      orderId,
      amount: Number(amount),
      buyerName: donorName || 'Hamba Allah',
      buyerEmail: email || 'support@islami.or.id',
      buyerPhone: phone || '081225147373',
      returnUrl: `${baseUrl}/donation/success?orderId=${orderId}`,
      notifyUrl: `${baseUrl}/api/ipaymu/webhook`,
      cancelUrl: `${baseUrl}/donation/cancel?orderId=${orderId}`,
    });

    // 2. Simpan record transaksi awal berstatus pending ke Sanity CMS
    await serverClient.create({
      _type: 'donationTransaction',
      orderId,
      donorName: donorName || 'Hamba Allah',
      amount: Number(amount),
      programName: programTitle || 'Sedekah Umum',
      status: 'pending',
      paymentUrl: ipaymuResponse.Url,
      transactionId: ipaymuResponse.TransactionId?.toString() || '',
    });

    return NextResponse.json({
      success: true,
      paymentUrl: ipaymuResponse.Url,
      sessionId: ipaymuResponse.SessionId,
      orderId,
    });

  } catch (error: any) {
    console.error('🔥 Gagal membuat transaksi donasi:', error);
    return NextResponse.json({ success: false, message: error.message || 'Terjadi kesalahan server.' }, { status: 500 });
  }
}