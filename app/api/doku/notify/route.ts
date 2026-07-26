// app/api/doku/notify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function handleNotification(req: Request) {
  try {
    let body: any = {};
    
    if (req.method === 'POST') {
      body = await req.json().catch(() => ({}));
    } else {
      // Jika DOKU mengetes via GET parameter URL
      const { searchParams } = new URL(req.url);
      body = {
        order: {
          invoice_number: searchParams.get('invoice_number') || searchParams.get('order_id'),
          amount: Number(searchParams.get('amount') || 0),
        },
        transaction: {
          status: searchParams.get('status') || 'SUCCESS'
        }
      };
    }

    console.log('🔔 DOKU NOTIFICATION RECEIVED:', JSON.stringify(body));

    const invoiceNumber = body.order?.invoice_number || body.invoice_number;
    const amount = Number(body.order?.amount || body.amount || 0);
    const transactionStatus = body.transaction?.status || body.result?.status || body.status || 'SUCCESS';

    if (invoiceNumber) {
      const query = `*[_type == "donation" && invoiceNumber == $invoiceNumber][0]`;
      const donationDoc = await sanityClient.fetch(query, { invoiceNumber });

      if (donationDoc) {
        if (donationDoc.status !== 'PAID') {
          await sanityClient.patch(donationDoc._id).set({ status: 'PAID' }).commit();
        }

        if (donationDoc.campaign?._ref) {
          const campaignId = donationDoc.campaign._ref;
          const campaignDoc = await sanityClient.fetch(`*[_id == $id][0]`, { id: campaignId });

          if (campaignDoc) {
            const currentCollected = Number(campaignDoc.collectedAmount || 0);
            const newCollected = currentCollected + (amount || donationDoc.amount || 0);

            await sanityClient
              .patch(campaignId)
              .set({ collectedAmount: newCollected })
              .commit();

            console.log(`🎉 BERHASIL! Campaign bertambah. Total: Rp ${newCollected}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error) {
    console.error('🔥 WEBHOOK ERROR:', error);
    return NextResponse.json({ status: 'ERROR', message: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleNotification(req);
}

export async function GET(req: Request) {
  return handleNotification(req);
}