// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';
import { createClient } from '@sanity/client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // 🚀 1. Import helper Supabase Server
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export const dynamic = 'force-dynamic';

const serverMetadataClient = createClient({
  projectId: '61d8vnuq',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'sk44JM4AlD6urcLa9Ak9vvnRpLGlsRai9aftW1wPA4w9zxwhrCpKREk2ArKU25K4kENIPxVXenu4kZhm2cOSaxGP69kz8az2qM2BZDIVzqyAGLjIvVTGKMu39CExUrKwbw2wCb2bfxKPgZ4lqEt2nwLZT4HEc4XT1qfrZ0i6KYupIlT6IOlP',
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lazisku.com';
  if (!siteUrl.includes('www.')) {
    siteUrl = siteUrl.replace('https://', 'https://www.');
  }
  
  let campaignTitle = 'Sedekah Subuh | LAZIS Khoiro Ummah';
  let campaignDesc = 'Awali hari dengan keberkahan. Sedekah subuh adalah waktu terbaik untuk berbagi kebaikan.'; 
  let imageUrl = '';

  try {
    const query = `*[(_type == "program" || _type == "campaign") && slug.current == $slug][0] {
      title,
      description,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "thumbnailUrl": thumbnail.asset->url,
      "bannerUrl": banner.asset->url
    }`;
    
    const found = await serverMetadataClient.fetch(query, { slug });
    
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
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
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

  // 🚀 2. Ambil sesi user yang sedang login di server secara aman
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const userEmail = session?.user?.email || '';
  const userMeta = session?.user?.user_metadata || {};
  const userName = userMeta.full_name || userMeta.name || userMeta.user_name || '';
  const userPhone = userMeta.phone || userMeta.phone_number || '';

  // 🚀 3. Lempar data user ke komponen Client di bawahnya
  return (
    <CampaignDetailClient 
      slug={slug} 
      referral={ref || null} 
      initialUser={{
        email: userEmail,
        name: userName,
        phone: userPhone,
      }}
    />
  );
}