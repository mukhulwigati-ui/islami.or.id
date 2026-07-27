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
    
    let finalAmount = amount > 0 ? amount : Number(donationDoc.amount || 0);

    if (programDoc) {
      const currentCollected = Number(programDoc.collectedAmount || 0);
      const newCollected = currentCollected + finalAmount;

      // Data donatur baru yang akan dimasukkan ke list
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

      console.log(`🎉 SUKSES BESAR! Program "${programDoc.title || programId}" bertambah Rp ${finalAmount}. Total terkumpul: Rp ${newCollected}`);
    }

    // 5. 🚀 FITUR KIRIM WHATSAPP OTOMATIS KE DONATUR
    const donorPhone = donationDoc.donorPhone;
    const donorName = donationDoc.donorName || 'Hamba Allah';
    const programTitle = programDoc?.title || 'Program Kebaikan';
    const formattedAmount = finalAmount.toLocaleString('id-ID');

    if (donorPhone) {
      try {
        // Format nomor telepon (pastikan berformat internasional misal 628...)
        let formattedPhone = donorPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.slice(1);
        }

        const waMessage = `Jazakumullah khairan, *${donorName}*.\n\nAlhamdulillah, donasi Anda sebesar *Rp ${formattedAmount}* untuk program *${programTitle}* telah berhasil diverifikasi.\n\nSemoga menjadi amal jariyah yang mengalir pahalanya dan mendatangkan keberkahan. Aamiin. 🚀`;

        // Contoh integrasi menggunakan Fonnte (Sesuaikan dengan API gateway WA Anda jika pakai Wablas/Twilio)
        const waRes = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': process.env.WHATSAPP_API_TOKEN || '', // Masukkan token API WA di file .env Anda
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: formattedPhone,
            message: waMessage,
          }),
        });

        const waJson = await waRes.json();
        console.log('📱 Status Kirim WhatsApp:', waJson);
      } catch (waError) {
        console.error('⚠️ Gagal mengirim pesan WhatsApp otomatis:', waError);
      }
    } else {
      console.log('ℹ️ Nomor WhatsApp donatur tidak tersedia, melewati pengiriman WA.');
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 CRITICAL ERROR DI WEBHOOK:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}