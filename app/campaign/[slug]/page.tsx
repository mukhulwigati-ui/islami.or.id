// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';
import { createClient } from '@sanity/client';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export const dynamic = 'force-dynamic';

const serverMetadataClient = createClient({
  projectId: 'xqggeww8',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skzKLS9YXZtUK01FN8VMv2TUleuscVo9d9SXtqAlcLjt3MvaRh0IWaaruV6ObSlpJwD5UoDI0QpPJ26Xh8EpaZsK7DIIMSZ1aq7EnLzUiCUY7aHsAm1a6LeJZb9I9ygWcRTKjEJzw8c5rRCbcFAxPhzjvAgPF715JSXnJxy2lbtWm6ePtVfl',
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  
  // Sesuaikan domain utama menjadi islami.or.id
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://islami.or.id';
  if (!siteUrl.startsWith('https://')) {
    siteUrl = `https://${siteUrl}`;
  }
  
  let campaignTitle = 'Program Donasi | Islami.or.id';
  let campaignDesc = 'Salurkan kebaikan dan sedekah terbaik Anda melalui program terpercaya di Islami.or.id.';  
  let imageUrl = '';

  try {
    // Query yang lebih fleksibel mencocokkan slug atau fallback ID
    const query = `*[(_type == "program" || _type == "campaign") && (slug.current == $slug || _id == $slug)[0] {
      title,
      description,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "thumbnailUrl": thumbnail.asset->url,
      "bannerUrl": banner.asset->url
    }`;
    
    const found = await serverMetadataClient.fetch(query, { slug: decodedSlug });
    
    if (found) {
      if (found.title) campaignTitle = found.title;
      
      if (found.description) {
        if (typeof found.description === 'string') {
          campaignDesc = found.description.slice(0, 140) + '...';
        } else if (Array.isArray(found.description)) {
          const plainText = found.description
            .filter((block: any) => block._type === 'block' && block.children)
            .map((block: any) => block.children.map((child: any) => child.text).join(''))
            .join(' ');
          if (plainText) campaignDesc = plainText.slice(0, 140) + '...';
        }
      }

      const finalSanityImage = found.mainImageUrl || found.imageUrl || found.thumbnailUrl || found.bannerUrl;
      if (finalSanityImage) {
        imageUrl = `${finalSanityImage}?format=jpg&w=1200&h=630&fit=crop`;
      }
    }
  } catch (error) {
    console.error('🔥 Direct server metadata query failed:', error);
  }

  // Fallback gambar default jika Sanity tidak merespons
  if (!imageUrl) {
    imageUrl = 'https://cdn.sanity.io/images/61d8vnuq/production/54504f4c2810fb8bece0e88229ef5e2ad6f0ba8c-1200x630.jpg?format=jpg';
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

// ===================================================================
// 🖥️ SERVER COMPONENT ENTRY
// ===================================================================
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