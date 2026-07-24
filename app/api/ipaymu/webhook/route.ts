// app/api/ipaymu/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { google } from 'googleapis';

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

// ===================================================================
// 📊 OTOMATISASI PENULISAN DATABASE KE GOOGLE SHEETS
// ===================================================================
async function appendToGoogleSheets(data: {
  orderId: string;
  name: string;
  phone: string;
  amount: number;
  program: string;
  date: string;
}) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    let cleanPhone = data.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const whatsappFormula = cleanPhone 
      ? `=HYPERLINK("https://wa.me/${cleanPhone}"; "${data.phone}")` 
      : '-';

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data.date, data.orderId, data.name, whatsappFormula, data.amount, data.program]],
      },
    });
    console.log('📊 MUTASI GOOGLE SHEETS SUKSES.');
  } catch (err) {
    console.error('🔥 GOOGLE SHEETS ERROR:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // iPaymu webhook payload umumnya berisi: trx_id, status, reference_id, total, etc.
    const { reference_id, status, trx_id, sid, total } = body;

    const cleanOrderId = reference_id ? String(reference_id).trim() : '';
    if (!cleanOrderId) {
      return NextResponse.json({ success: false, message: 'Reference ID tidak ditemukan dalam payload.' }, { status: 400 });
    }

    // Tentukan status berdasarkan respons iPaymu (status == 'berhasil' / 'success' atau status_code == '1')
    const isSuccess = status === 'berhasil' || status === 'success' || body.status_code === '1';
    const newStatus = isSuccess ? 'success' : 'failed';

    // 1. Cari dokumen transaksi berdasarkan orderId / referenceId di Sanity CMS
    const query = `*[_type == "donationTransaction" && orderId == $orderId][0]`;
    const transaction = await serverClient.fetch(query, { orderId: cleanOrderId });

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan di database.' }, { status: 404 });
    }

    // Jika transaksi sudah sukses sebelumnya, cegah eksekusi ganda
    if (transaction.status === 'success') {
      return NextResponse.json({ success: true, message: "Sudah diproses sebelumnya." });
    }

    // Update status transaksi di Sanity CMS
    await serverClient
      .patch(transaction._id)
      .set({
        status: newStatus,
        ipaymuTrxId: trx_id?.toString() || sid?.toString() || '',
      })
      .commit();

    if (!isSuccess) {
      return NextResponse.json({ success: true, message: 'Status pembayaran belum sukses/gagal dicatat.' });
    }

    const donorNameFromForm = transaction.donorName ? String(transaction.donorName).trim() : 'Hamba Allah';
    const donorPhoneFromForm = transaction.donorPhone ? String(transaction.donorPhone).trim() : '';
    const programSlug = transaction.slug ? String(transaction.slug).toLowerCase().trim() : 'sedekah-subuh';
    const paymentMethodUsed = transaction.paymentMethod ? String(transaction.paymentMethod).toUpperCase() : 'QRIS';
    const donationAmount = Number(total) || Number(transaction.amount) || 0;

    // 2. Ambil data program di Sanity untuk update progres donasi
    const findQuery = `*[_type == "program" && slug.current == $slug][0] { _id, title, collectedRaw, donors }`;
    const finalProgram = await serverClient.fetch(findQuery, { slug: programSlug });

    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentFullTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // 3. JALANKAN LOGIKA AFILIASI (Ujrah 10%)
    const refPhone = transaction.fundraiserPhone;
    if (refPhone) {
      let formattedRefPhone = refPhone.replace(/[^0-9]/g, '');
      let alternativeRefPhone = formattedRefPhone;
      
      if (formattedRefPhone.startsWith('0')) {
        alternativeRefPhone = '62' + formattedRefPhone.slice(1);
      } else if (formattedRefPhone.startsWith('62')) {
        alternativeRefPhone = '0' + formattedRefPhone.slice(2);
      }

      const fundraiser = await serverClient.fetch(
        `*[_type == "fundraiser" && (phone == $phone || phone == $altPhone)][0]`, 
        { phone: refPhone.trim(), altPhone: alternativeRefPhone }
      );

      if (fundraiser) {
        const ujrah = donationAmount * 0.1;
        await serverClient.patch(fundraiser._id)
          .setIfMissing({ totalDanaDihimpun: 0, sisaSaldoFee: 0, totalTransaksiSukses: 0 })
          .inc({ totalDanaDihimpun: donationAmount, sisaSaldoFee: ujrah, totalTransaksiSukses: 1 })
          .commit();
        console.log(`✅ Ujrah Rp ${ujrah} berhasil ditambahkan ke saldo ${fundraiser.name}`);
      }
    }

    // 4. Update Progress Bar Program & Tambah Donatur jika program ditemukan
    if (finalProgram) {
      await serverClient.patch(finalProgram._id)
        .setIfMissing({ collectedRaw: 0, donors: [] })
        .inc({ collectedRaw: donationAmount }) 
        .append('donors', [{
          _key: `donor-${cleanOrderId}-${Math.random().toString(36).substring(2, 5)}`,
          orderId: cleanOrderId,
          name: donorNameFromForm,
          amount: donationAmount,
          date: currentDate
        }])
        .commit();

      // 📊 Catat Mutasi ke Google Sheets
      await appendToGoogleSheets({ 
        date: currentDate, 
        orderId: cleanOrderId, 
        name: donorNameFromForm, 
        phone: donorPhoneFromForm, 
        amount: donationAmount, 
        program: finalProgram.title 
      });
    }

    // 5. 📲 NOTIFIKASI WHATSAPP PREMIUM VIA FONNTE
    if (donorPhoneFromForm) {
      let formattedPhone = donorPhoneFromForm.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
      
      const messageText = `*DONASI BERHASIL DITERIMA* 🎉
  
Jazakumullah khairan, Kak *${donorNameFromForm}*. Donasi Anda telah berhasil kami verifikasi dengan detail berikut:

📝 *No. Invoice:* ${cleanOrderId}
📌 *Program:* ${finalProgram?.title || 'Program Kebaikan'}
💰 *Nominal:* Rp ${donationAmount.toLocaleString('id-ID')}
💳 *Metode:* ${paymentMethodUsed}
⏰ *Tanggal:* ${currentDate} - ${currentFullTime} WIB

Semoga sedekah yang ditunaikan menjadi penggugur dosa, pembuka pintu rezeki, dan membawa keberkahan yang berlipat ganda untuk Anda beserta keluarga. Aamiin Yaa Rabbal 'Aalamiin.

----------------------------
*Yayasan Islam Ibadurrohman Cilacap*
_Salurkan kepedulian Anda secara amanah & transparan di islami.or.id_`;

      try {
        await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { 'Authorization': process.env.FONNTE_TOKEN || '' },
          body: new URLSearchParams({ target: formattedPhone, message: messageText }),
        });
      } catch (err) { 
        console.error('🔥 Fonnte error:', err); 
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook iPaymu dan otomatisasi berhasil diproses.' });

  } catch (error: any) {
    console.error('🔥 Gagal memproses webhook iPaymu:', error);
    return NextResponse.json({ success: false, message: error.message || 'Terjadi kesalahan server.' }, { status: 500 });
  }
}