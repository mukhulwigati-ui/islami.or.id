// app/api/programs/route.ts
import { NextResponse } from 'next/server';
import { clientPublik as client } from '@/lib/sanity';

// 🚀 Nonaktifkan cache agar data langsung ter-update secara real-time
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET() {
  try {
    // 🚀 Ambil data program/campaign sekaligus data transaksi sukses yang berelasi
    const query = `{
      "programs": *[_type in ["program", "campaign"]] | order(_createdAt desc) {
        "id": _id,
        "slug": slug.current,
        title,
        category,
        sectionType,
        "image": coalesce(image.asset->url, mainImage.asset->url, thumbnail.asset->url, banner.asset->url),
        collectedAmount,
        collectedRaw,
        collected,
        targetAmount,
        daysLeft,
        description,
        donors,
        reports
      },
      "transactions": *[_type == "donationTransaction" && status == "success"] {
        amount,
        donorName,
        "programId": programName._ref
      }
    }`;

    const result = await client.fetch(query);
    const sanityPrograms = result.programs || [];
    const successTransactions = result.transactions || [];

    const formattedData = sanityPrograms.map((program: any) => {
      const rawAmount = Number(program.collectedAmount ?? program.collectedRaw ?? program.collected ?? 0);
      const targetAmount = Number(program.targetAmount || 50000000);
      
      // 🚀 Hitung jumlah donatur berdasarkan transaksi sukses yang merujuk ke program ini
      const programTransactions = successTransactions.filter((tx: any) => tx.programId === program.id);
      const manualDonors = Array.isArray(program.donors) ? program.donors : [];
      
      // Total donatur adalah gabungan dari array donors di program + transaksi sukses real
      const totalDonorsCount = Math.max(manualDonors.length, programTransactions.length);

      return {
        id: program.id,
        _id: program.id,
        slug: program.slug,
        title: program.title,
        category: program.category || 'Kemanusiaan',
        sectionType: program.sectionType || 'pilihan',
        image: program.image || 'https://via.placeholder.com/385x176?text=No+Image',
        collected: `Rp ${rawAmount.toLocaleString('id-ID')}`,
        collectedRaw: rawAmount,
        collectedAmount: rawAmount,
        target: `Rp ${targetAmount.toLocaleString('id-ID')}`,
        targetAmount: targetAmount,
        daysLeft: program.daysLeft || null,
        description: program.description || null,
        donors: manualDonors,
        donorsCount: totalDonorsCount,
        reports: program.reports || []
      };
    });

    return NextResponse.json(
      { success: true, data: formattedData },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );

  } catch (error: any) {
    console.error('🔥 Sanity Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}