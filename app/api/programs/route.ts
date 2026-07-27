// app/api/programs/route.ts
import { NextResponse } from 'next/server';
import { clientPublik as client } from '@/lib/sanity';

// 🚀 Nonaktifkan cache agar data langsung ter-update secara real-time
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET() {
  try {
    // 🚀 Diperbarui agar mendeteksi _type "program" maupun "campaign", serta menangkap variasi field gambar
    const query = `*[_type in ["program", "campaign"]] | order(_createdAt desc) {
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
    }`;

    const sanityPrograms = await client.fetch(query);

    const formattedData = sanityPrograms.map((program: any) => {
      const rawAmount = Number(program.collectedAmount ?? program.collectedRaw ?? program.collected ?? 0);
      const targetAmount = Number(program.targetAmount || 50000000);
      const donorsList = Array.isArray(program.donors) ? program.donors : [];

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
        donors: donorsList,
        // 🚀 Memastikan donorsCount menghitung panjang array donors dengan akurat
        donorsCount: donorsList.length,
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