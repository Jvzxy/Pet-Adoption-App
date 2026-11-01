import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function isValidSignature(
  body: string,
  header: string | null,
  webhookSecret: string,
  liveMode: boolean,
): Promise<boolean> {
  if (!header) return false;
  const values = new Map(
    header.split(',').map((part) => {
      const separator = part.indexOf('=');
      return separator < 0
        ? ['', '']
        : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
    }),
  );
  const providedSignature = values.get(liveMode ? 'li' : 'te');
  if (!providedSignature) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = toHex(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body))));
  return constantTimeEqual(expected, providedSignature.toLowerCase());
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const webhookSecret = Deno.env.get('PAYMONGO_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('PayMongo webhook server configuration is incomplete.');
    return jsonResponse({ error: 'Webhook configuration is incomplete.' }, 503);
  }

  const body = await request.text();
  let event: Record<string, unknown> | null;
  try {
    event = asRecord(JSON.parse(body));
  } catch {
    return jsonResponse({ error: 'Invalid webhook payload.' }, 400);
  }

  const eventData = asRecord(event?.data);
  const liveMode = eventData?.livemode === true;
  const signature = request.headers.get('PayMongo-Signature')
    ?? request.headers.get('X-Paymongo-Signature');
  if (!await isValidSignature(body, signature, webhookSecret, liveMode)) {
    return jsonResponse({ error: 'Invalid webhook signature.' }, 401);
  }

  if (eventData?.type !== 'checkout_session.payment.paid') {
    return jsonResponse({ received: true });
  }

  const session = asRecord(eventData.data);
  const sessionAttributes = asRecord(session?.attributes);
  const referenceNumber = sessionAttributes?.reference_number;
  const sessionPayments = Array.isArray(sessionAttributes?.payments)
    ? sessionAttributes.payments
    : [];
  const hasPaidAttempt = sessionPayments.some((payment) => {
    const paymentRecord = asRecord(payment);
    const paymentAttributes = asRecord(paymentRecord?.attributes);
    return paymentAttributes?.status === 'paid';
  });
  if (typeof referenceNumber !== 'string' || !hasPaidAttempt) {
    return jsonResponse({ error: 'Paid checkout event is missing its order reference or paid payment.' }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, payment_status, payment_method, paymongo_checkout_session_id')
    .eq('order_number', referenceNumber)
    .in('payment_method', ['paymongo_card', 'paymongo_gcash', 'paymongo_maya'])
    .maybeSingle();

  if (orderError) {
    console.error('Could not find the order for PayMongo webhook:', orderError.message);
    return jsonResponse({ error: 'Could not look up the order.' }, 500);
  }
  if (!order) return jsonResponse({ error: 'Order reference was not found.' }, 404);
  if (order.paymongo_checkout_session_id !== session?.id) {
    return jsonResponse({ error: 'Checkout session does not match the order.' }, 409);
  }
  if (order.payment_status === 'paid') return jsonResponse({ received: true });

  const { error: updateError } = await serviceClient
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', order.id)
    .eq('payment_status', 'pending');
  if (updateError) {
    console.error('Could not mark the PayMongo order as paid:', updateError.message);
    return jsonResponse({ error: 'Could not record payment.' }, 500);
  }

  return jsonResponse({ received: true });
});
