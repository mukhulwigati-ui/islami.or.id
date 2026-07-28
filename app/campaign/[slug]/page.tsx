// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://islami.or.id';
  if (!siteUrl.startsWith('https://')) {
    siteUrl = `https://${siteUrl}`;
  }
  
  let campaignTitle = 'Program Donasi | Islami.or.id';
  let campaignDesc = 'Salurkan kebaikan dan sedekah terbaik Anda melalui program terpercaya di Islami.or.id.';  
  let imageUrl = 'https://cdn.sanity.io/images/61d8vnuq/production/54504f4c2810fb8bece0e88229ef5e2ad6f0ba8c-1200x630.jpg?format=jpg';

  try {
    // Ambil data langsung dari endpoint API publik aplikasi Anda yang sudah terhubung dengan benar
    const res = await fetch(`${siteUrl}/api/programs`, { cache: 'no-store' });
    const json = await res.json();
    
    if (json.success && json.data) {
      const found = json.data.find((p: any) => p.slug === decodedSlug || p._id === decodedSlug);
      
      if (found) {
        if (found.title) campaignTitle = found.title;
        if (found.description || found.excerpt) {
          campaignDesc = (found.description || found.excerpt).slice(0, 140) + '...';
        }
        if (found.imageUrl || found.image) {
          imageUrl = found.imageUrl || found.image;
        }
      }
    }
  } catch (error) {
    console.error('🔥 Metadata fetch API failed:', error);
  }

  return {
    title: campaignTitle,
    description: campaignDesc,
    alternates: {
      canonical: `${siteUrl}/campaign/${slug}`,
    },
    openGraph: {
      title: campaignTitle,
      description: campaignDesc,
      url: `${siteUrl}/campaign/${slug}`,
      siteName: 'Islami.or.id',
      locale: 'id_ID',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: campaignTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaignTitle,
      description: campaignDesc,
      images: [imageUrl],
    },
  };
}

export default async function CampaignPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams;

  return (
    <CampaignDetailClient 
      slug={slug} 
      referral={ref || null} 
    />
  );
}