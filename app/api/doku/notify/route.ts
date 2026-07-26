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
    console.log('🔔 FULL DOKU PAYLOAD:', JSON.stringify(body, null, 2));

    // Menangkap berbagai kemungkinan struktur invoice & amount dari DOKU Non-SNAP
    const invoiceNumber = 
      body.order?.invoice_number || 
      body.invoice_number || 
      body.virtual_account_info?.invoice_number;

    const amount = Number(
      body.order?.amount || 
      body.amount || 
      body.virtual_account_info?.amount || 
      0
    );

    console.log(`📝 Extracted -> Invoice: ${invoiceNumber}, Amount: ${amount}`);

    if (!invoiceNumber) {
      return NextResponse.json({ status: 'FAILED', message: 'Invoice not found in payload' }, { status: 400 });
    }

    // 1. Cari dokumen donasi di Sanity berdasarkan invoiceNumber
    const query = `*[_type == "donation" && invoiceNumber == $invoiceNumber][0]`;
    const donationDoc = await sanityClient.fetch(query, { invoiceNumber });

    if (donationDoc) {
      // Update status donasi menjadi PAID
      if (donationDoc.status !== 'PAID') {
        await sanityClient.patch(donationDoc._id).set({ status: 'PAID' }).commit();
      }

      // 2. Tambahkan ke Campaign terkait
      if (donationDoc.campaign?._ref) {
        const campaignId = donationDoc.campaign._ref;
        const campaignDoc = await sanityClient.fetch(`*[_id == $id][0]`, { id: campaignId });

        if (campaignDoc) {
          const currentCollected = Number(campaignDoc.collectedAmount || 0);
          const finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);
          const newCollected = currentCollected + finalAmount;

          await sanityClient
            .patch(campaignId)
            .set({ collectedAmount: newCollected })
            .commit();

          console.log(`🎉 BERHASIL UPDATE SANITY! Campaign bertambah: Rp ${finalAmount}. Total: Rp ${newCollected}`);
        }
      }
    } else {
      console.warn(`⚠️ Warning: Invoice ${invoiceNumber} tidak ditemukan di database Sanity.`);
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 WEBHOOK CRASH:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}