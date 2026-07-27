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
      console.log('✅ Status transaksi berhasil diubah menjadi success di Sanity.');
    }

    // 3. Ambil Program ID dari reference programName._ref (fallback ke program pertama)
    let programId = donationDoc.programName?._ref;

    if (!programId) {
      const defaultProgram = await sanityClient.fetch(`*[_type == "program"][0]`);
      if (defaultProgram) {
        programId = defaultProgram._id;
      }
    }

    let programDoc = null;
    let finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);

    if (programId) {
      programDoc = await sanityClient.fetch(`*[_id == $id][0]`, { id: programId });
      
      if (programDoc) {
        const currentCollected = Number(programDoc.collectedAmount || 0);
        const newCollected = currentCollected + finalAmount;

        const newDonorEntry = {
          _key: Math.random().toString(36).substring(2),
          name: donationDoc.donorName || 'Hamba Allah',
          amount: finalAmount,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        };

        await sanityClient
          .patch(programId)
          .set({ collectedAmount: newCollected })
          .append('donors', [newDonorEntry])
          .commit();

        console.log(`🎉 SUKSES! Program "${programDoc.title || programId}" bertambah Rp ${finalAmount}. Total terkumpul: Rp ${newCollected}`);
      }
    }

    // 4. 🚀 EKSEKUSI KIRIM WHATSAPP OTOMATIS KE DONATUR (Terisolasi agar aman dari error lain)
    try {
      const donorPhone = donationDoc.donorPhone;
      const donorName = donationDoc.donorName || 'Hamba Allah';
      const programTitle = programDoc?.title || 'Program Kebaikan';
      const formattedAmount = finalAmount.toLocaleString('id-ID');

      console.log('📱 MEMULAI PENGIRIMAN WA. Nomor Target:', donorPhone);

      if (donorPhone) {
        let formattedPhone = String(donorPhone).replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.slice(1);
        }

        const waMessage = `Jazakumullah khairan, *${donorName}*.\n\nAlhamdulillah, donasi Anda sebesar *Rp ${formattedAmount}* untuk program *${programTitle}* telah berhasil diverifikasi.\n\nSemoga menjadi amal jariyah yang mengalir pahalanya dan mendatangkan keberkahan. Aamiin. 🚀`;

        // 🚀 Membaca FONNTE_TOKEN dari Vercel dengan fallback ke WHATSAPP_API_TOKEN
        const fonnteToken = process.env.FONNTE_TOKEN || process.env.WHATSAPP_API_TOKEN;
        console.log('🔑 Token Fonnte terdeteksi (panjang karakter):', fonnteToken ? fonnteToken.length : 'KOSONG!');

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