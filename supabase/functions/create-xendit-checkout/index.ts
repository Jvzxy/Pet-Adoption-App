import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const paymentChannels: Record<string, string> = {
  xendit_card: 'CARDS',
  xendit_gcash: 'GCASH',
  xendit_maya: 'PAYMAYA',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const xenditSecret = Deno.env.get('XENDIT_SECRET_KEY');
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !xenditSecret) {
    return jsonResponse({ error: 'Xendit server configuration is incomplete.' }, 503);
  }
  if (!authorization) return jsonResponse({ error: 'Sign in before starting checkout.' }, 401);

  try {
    const body = await request.json() as { order_id?: unknown; payment_method?: unknown };
    if (typeof body.order_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.order_id)) {
      return jsonResponse({ error: 'A valid order ID is required.' }, 400);
    }
    if (typeof body.payment_method !== 'string' || !(body.payment_method in paymentChannels)) {
      return jsonResponse({ error: 'Choose a supported Xendit payment method.' }, 400);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: 'Your session is invalid. Sign in again.' }, 401);

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id, order_number, customer_id, title, items, price, status, payment_method, payment_status, xendit_invoice_id, xendit_invoice_url')
      .eq('id', body.order_id)
      .eq('customer_id', user.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return jsonResponse({ error: 'Order not found for this account.' }, 404);
    if (order.payment_method !== body.payment_method) {
      return jsonResponse({ error: 'The payment method does not match this order.' }, 400);
    }
    if (order.payment_status === 'paid') {
      return jsonResponse({ error: 'This order has already been paid.' }, 409);
    }
    if (order.status !== 'Processing') {
      return jsonResponse({ error: 'Checkout is only available for orders being processed.' }, 409);
    }
    if (order.xendit_invoice_id && order.xendit_invoice_url) {
      return jsonResponse({ invoice_url: order.xendit_invoice_url });
    }

    const amount = Number(order.price);
    if (!Number.isFinite(amount) || amount < 1) {
      return jsonResponse({ error: 'The order total is invalid for online payment.' }, 400);
    }

    const returnUrl = `pawfectcats://payment-return?order_id=${encodeURIComponent(order.id)}`;
    const items = Array.isArray(order.items)
      ? order.items.flatMap((item) => {
          const record = asRecord(item);
          if (!record) return [];
          const quantity = Number(record.quantity);
          const price = Number(record.unit_price);
          if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) return [];
          return [{
            name: String(record.title ?? order.title).slice(0, 100),
            quantity,
            price,
          }];
        })
      : [];

    const createResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${xenditSecret}:`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: order.order_number,
        amount,
        currency: 'PHP',
        description: String(order.title).slice(0, 255),
        invoice_duration: 86400,
        payment_methods: [paymentChannels[body.payment_method]],
        success_redirect_url: returnUrl,
        failure_redirect_url: returnUrl,
        items,
      }),
    });
    const invoice = asRecord(await createResponse.json());
    const invoiceId = invoice?.id;
    const invoiceUrl = invoice?.invoice_url;
    if (!createResponse.ok || typeof invoiceId !== 'string' || typeof invoiceUrl !== 'string') {
      console.error('Xendit rejected the invoice request:', createResponse.status);
      return jsonResponse({
        error: typeof invoice?.message === 'string'
          ? invoice.message
          : 'Xendit could not create the payment invoice. Check the enabled payment channels.',
      }, 502);
    }

    const { error: saveError } = await serviceClient
      .from('orders')
      .update({ xendit_invoice_id: invoiceId, xendit_invoice_url: invoiceUrl })
      .eq('id', order.id)
      .eq('customer_id', user.id)
      .eq('payment_status', 'pending');
    if (saveError) throw saveError;

    return jsonResponse({ invoice_url: invoiceUrl });
  } catch (error) {
    console.error(
      'Could not create Xendit invoice:',
      error instanceof Error ? error.message : 'Unexpected server error',
    );
    return jsonResponse({ error: 'Could not start secure checkout. Please try again.' }, 500);
  }
});
