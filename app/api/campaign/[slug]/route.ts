// app/api/campaign/[slug]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

const client = createClient({
  projectId: 'xqggeww8',
  dataset: 'production',
  useCdn: false, // Wajib false agar data langsung ditarik real-time
  apiVersion: '2024-01-01',
  token: 'skzKLS9YXZtUK01FN8VMv2TUleuscVo9d9SXtqAlcLjt3MvaRh0IWaaruV6ObSlpJwD5UoDI0QpPJ26Xh8EpaZsK7DIIMSZ1aq7EnLzUiCUY7aHsAm1a6LeJZb9I9ygWcRTKjEJzw8c5rRCbcFAxPhzjvAgPF715JSXnJxy2lbtWm6ePtVfl',
});

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // 🚀 FIXED: Menarik semua kemungkinan nama field gambar di Sanity Studio kamu
    const query = `*[(_type == "program" || _type == "campaign") && slug.current == $slug][0] {
      title,
      description,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "thumbnailUrl": thumbnail.asset->url,
      "bannerUrl": banner.asset->url
    }`;

    const data = await client.fetch(query, { slug });

    if (!data) {
      return NextResponse.json({ success: false, message: 'Campaign tidak ditemukan' }, { status: 404 });
    }

    // 🚀 MASTER LOGIC: Pilih gambar mana pun yang tersedia dari database Sanity kamu
    const finalImageUrl = data.mainImageUrl || data.imageUrl || data.thumbnailUrl || data.bannerUrl || null;

    return NextResponse.json({ 
      success: true, 
      data: {
        title: data.title,
        description: data.description,
        imageUrl: finalImageUrl // Mengembalikan string URL gambar murni yang valid
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}