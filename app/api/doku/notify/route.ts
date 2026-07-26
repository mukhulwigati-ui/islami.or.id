// app/api/doku/notify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // 2. Update status pembayaran menjadi 'success' pada tabel transaksi
    if (donationDoc.status !== 'success') {
      await sanityClient.patch(donationDoc._id).set({ status: 'success' }).commit();
      console.log('✅ Status transaksi berhasil diubah menjadi success.');
    }

    // 3. Ambil Program ID dari reference programName._ref (atau ambil program pertama sebagai fallback)
    let programId = donationDoc.programName?._ref;

    if (!programId) {
      const defaultProgram = await sanityClient.fetch(`*[_type == "program"][0]`);
      if (defaultProgram) {
        programId = defaultProgram._id;
      }
    }

    if (!programId) {
      console.error('❌ ERROR: Tidak ada dokumen program ditemukan di Sanity!');
      return NextResponse.json({ status: 'NO_PROGRAM_FOUND' }, { status: 400 });
    }

    // 4. Ambil data program, update collectedAmount, dan masukkan data donatur ke array donors
    const programDoc = await sanityClient.fetch(`*[_id == $id][0]`, { id: programId });
    
    if (programDoc) {
      const currentCollected = Number(programDoc.collectedAmount || 0);
      const finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);
      const newCollected = currentCollected + finalAmount;

      // Data donatur baru yang akan dimasukkan ke list
      const newDonorEntry = {
        _key: Math.random().toString(36.substring(2)), // Unique key untuk item array Sanity
        name: donationDoc.donorName || 'Hamba Allah',
        amount: finalAmount,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      };

      await sanityClient
        .patch(programId)
        .set({ collectedAmount: newCollected })
        .append('donors', [newDonorEntry]) // Otomatis menambahkan donatur ke list
        .commit();

      console.log(`🎉 SUKSES BESAR! Program "${programDoc.title || programId}" bertambah Rp ${finalAmount}. Total terkumpul: Rp ${newCollected}`);
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 CRITICAL ERROR DI WEBHOOK:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}