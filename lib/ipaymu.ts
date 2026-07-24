// lib/ipaymu.ts
import crypto from 'crypto';

interface CreateTransactionParams {
  orderId: string;
  amount: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  returnUrl: string;
  notifyUrl: string;
  cancelUrl: string;
}

export async function createIpaymuTransaction(params: CreateTransactionParams) {
  const va = process.env.IPAYMU_VA;
  const apiKey = process.env.IPAYMU_API_KEY;
  const isSandbox = process.env.IPAYMU_SANDBOX === 'true';

  if (!va || !apiKey) {
    throw new Error('🔥 Kredensial iPaymu (VA atau API Key) belum disetel di environment variables.');
  }

  const baseUrl = isSandbox 
    ? 'https://sandbox.ipaymu.com/api/v2/payment' 
    : 'https://my.ipaymu.com/api/v2/payment';

  const body = {
    product: [params.orderId],
    qty: [1],
    price: [params.amount],
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
    cancelUrl: params.cancelUrl,
    referenceId: params.orderId,
    buyerName: params.buyerName,
    buyerPhone: params.buyerPhone || '081225147373',
    buyerEmail: params.buyerEmail || 'support@islami.or.id',
  };

  const bodyString = JSON.stringify(body);
  const salt = crypto.createHash('sha256').update(bodyString).digest('hex');
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]; // YYYYMMDDHHmmss
  
  // Format String to Sign: method:va:salt:apiKey
  const stringToSign = `POST:${va}:${salt}:${apiKey}`;
  const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'va': va,
      'signature': signature,
      'timestamp': timestamp,
    },
    body: bodyString,
  });

  const data = await response.json();

  if (!response.ok || data.Status !== 200) {
    throw new Error(`Gagal membuat transaksi iPaymu: ${data.Message || 'Terjadi kesalahan sistem'}`);
  }

  return data.Data; // Berisi url pembayaran, transactionId, qris, dll.
}