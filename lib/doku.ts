// lib/doku.ts
import crypto from 'crypto';

interface CreateDokuCheckoutParams {
  orderId: string;
  amount: number | string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  returnUrl: string;
  notifyUrl: string;
}

export async function createDokuCheckout(params: CreateDokuCheckoutParams) {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  const isSandbox = process.env.DOKU_IS_SANDBOX === 'true';

  if (!clientId || !secretKey) {
    throw new Error('🔥 Kredensial DOKU (Client ID atau Secret Key) belum disetel di environment variables.');
  }

  // 🚀 Paksa konversi amount menjadi integer murni dan cegah angka bengkak
  const cleanAmount = Number(String(params.amount).replace(/[^0-9]/g, ''));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new Error('Nominal donasi tidak valid.');
  }

  const baseUrl = isSandbox
    ? 'https://api-sandbox.doku.com/checkout/v1/payment'
    : 'https://api.doku.com/checkout/v1/payment';

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().slice(0, 19) + 'Z';

  const requestBody = {
    order: {
      amount: cleanAmount, // Menggunakan nominal yang sudah dibersihkan
      invoice_number: params.orderId,
      currency: 'IDR',
      callback_url: params.returnUrl,
      expired_time: 60,
      notification_url: params.notifyUrl,
    },
    payment: {
      payment_due_date: 60,
    },
    customer: {
      name: params.buyerName,
      email: params.buyerEmail || 'support@islami.or.id',
      phone: params.buyerPhone || '081225147373',
    },
  };

  const jsonBody = JSON.stringify(requestBody);
  const digest = crypto.createHash('sha256').update(jsonBody).digest('base64');
  
  const requestTarget = '/checkout/v1/payment';
  const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('base64');

  const headers = {
    'Content-Type': 'application/json',
    'Client-Id': clientId,
    'Request-Id': requestId,
    'Request-Timestamp': timestamp,
    'Signature': `HMACSHA256=${signature}`,
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: headers,
    body: jsonBody,
  });

  const data = await response.json();

  if (!response.ok || !data.response?.payment?.url) {
    throw new Error(`Gagal membuat transaksi DOKU: ${data.error?.message || data.message || 'Terjadi kesalahan sistem'}`);
  }

  return {
    paymentUrl: data.response.payment.url,
    transactionId: data.response.uuid,
  };
}