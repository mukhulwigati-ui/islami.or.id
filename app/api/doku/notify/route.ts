// app/api/doku/notify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔔 DOKU WEBHOOK MASUK:', JSON.stringify(body, null, 2));

    // Menangkap struktur order ID dan amount dari berbagai variasi payload DOKU
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

    if (!orderId) {
      console.error('❌ ERROR: Order ID / Invoice kosong dari payload DOKU!');
      return NextResponse.json({ status: 'FAILED', message: 'Order ID not found' }, { status: 400 });
    }

    // 1. Cari data transaksi donasi berdasarkan orderId
    const donationDoc = await sanityClient.fetch(
      `*[_type == "donationTransaction" && orderId == $orderId][0]`,
      { orderId }
    );

    if (!donationDoc) {
      console.error(`❌ ERROR: Transaksi dengan Order ID "${orderId}" tidak ditemukan di Sanity!`);
      return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    // 2. Update status pembayaran menjadi 'success'
    if (donationDoc.status !== 'success') {
      await sanityClient.patch(donationDoc._id).set({ status: 'success' }).commit();
      console.log('✅ Status transaksi berhasil diubah menjadi success.');
    }

    // 3. Ambil Campaign ID dari reference programName._ref
    const campaignId = donationDoc.programName?._ref;
    
    if (!campaignId) {
      console.error('❌ ERROR: Field reference programName._ref kosong pada dokumen donasi ini!');
      return NextResponse.json({ status: 'NO_CAMPAIGN_REF' }, { status: 400 });
    }

    // 4. Ambil data campaign saat ini dan tambahkan jumlah terkumpulnya
    const campaignDoc = await sanityClient.fetch(`*[_id == $id][0]`, { id: campaignId });
    
    if (campaignDoc) {
      const currentCollected = Number(campaignDoc.collectedAmount || 0);
      const finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);
      const newCollected = currentCollected + finalAmount;

      await sanityClient
        .patch(campaignId)
        .set({ collectedAmount: newCollected })
        .commit();

      console.log(`🎉 SUKSES! Campaign bertambah Rp ${finalAmount}. Total terkumpul: Rp ${newCollected}`);
    } else {
      console.warn(`⚠️ Warning: Campaign dengan ID "${campaignId}" tidak ditemukan di Sanity.`);
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 CRITICAL ERROR DI WEBHOOK:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}