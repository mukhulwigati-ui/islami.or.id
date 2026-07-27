// app/api/programs/route.ts
import { NextResponse } from 'next/server';
import { clientPublik as client } from '@/lib/sanity';

// 🚀 Set dynamic agar selalu fresh mengambil data terbaru dari Sanity
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET() {
  try {
    const query = `*[_type == "program"] | order(_createdAt desc) {
      "id": _id,
      "slug": slug.current,
      title,
      category,
      sectionType,
      "image": image.asset->url,
      collectedAmount,
      targetAmount,
      daysLeft,
      description,
      donors
    }`;

    const sanityPrograms = await client.fetch(query);

    const formattedData = sanityPrograms.map((program: any) => {
      // 🚀 Membaca collectedAmount yang di-update oleh webhook
      const rawAmount = Number(program.collectedAmount || 0);
      const targetAmount = Number(program.targetAmount || 50000000);

      return {
        id: program.id,
        slug: program.slug,
        title: program.title,
        category: program.category || 'Kemanusiaan',
        sectionType: program.sectionType || 'pilihan',
        image: program.image || 'https://via.placeholder.com/385x176?text=No+Image',
        collected: `Rp ${rawAmount.toLocaleString('id-ID')}`,
        collectedRaw: rawAmount, // Dibiarkan agar komponen lain tidak error
        collectedAmount: rawAmount,
        target: `Rp ${targetAmount.toLocaleString('id-ID')}`,
        targetAmount: targetAmount,
        daysLeft: program.daysLeft || null,
        description: program.description || null,
        donors: program.donors || []
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