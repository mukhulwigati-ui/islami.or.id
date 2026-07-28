// app/campaign/[slug]/page.tsx

import { Metadata } from "next";
import CampaignDetailClient from "@/components/CampaignDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.islami.or.id"
  ).replace(/\/$/, "");

  let title = "Program Donasi | islami.or.id";

  let description =
    "Salurkan sedekah, infak, zakat, dan wakaf terbaik Anda melalui islami.or.id.";

  // Gambar default
  let image =
    `${siteUrl}/images/banner.png`;

  try {
    const res = await fetch(`${siteUrl}/api/programs`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const campaign = json.data.find(
          (item: any) =>
            item.slug === decodedSlug ||
            item._id === decodedSlug
        );

        if (campaign) {
          title = campaign.title || title;

          const rawDesc =
            campaign.excerpt ||
            campaign.description ||
            description;

          description = String(rawDesc)
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 160);

          if (campaign.image) {
            image = campaign.image;
          }

          // Hapus parameter yang sering membuat crawler bermasalah
          image = image
            .replace("?format=jpg", "")
            .replace("&format=jpg", "")
            .replace("?fm=jpg", "")
            .replace("&fm=jpg", "");

          // Pastikan absolut
          if (!image.startsWith("http")) {
            image = `${siteUrl}${image}`;
          }
        }
      }
    }
  } catch (err) {
    console.error("Metadata Error:", err);
  }

  return {
    metadataBase: new URL(siteUrl),

    title,

    description,

    alternates: {
      canonical: `/campaign/${decodedSlug}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "website",
      url: `${siteUrl}/campaign/${decodedSlug}`,
      siteName: "islami.or.id",
      locale: "id_ID",

      title,
      description,

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CampaignPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { ref } = await searchParams;

  return (
    <CampaignDetailClient
      slug={slug}
      referral={ref ?? null}
    />
  );
}