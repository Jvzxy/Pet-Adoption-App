import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const methodTypes: Record<string, string> = {
  paymongo_card: 'card',
  paymongo_gcash: 'gcash',
  paymongo_maya: 'paymaya',
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
  const paymongoSecret = Deno.env.get('PAYMONGO_SECRET_KEY');
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !paymongoSecret) {
    return jsonResponse({ error: 'PayMongo server configuration is incomplete.' }, 503);
  }
  if (!authorization) return jsonResponse({ error: 'Sign in before starting checkout.' }, 401);

  try {
    const body = await request.json() as { order_id?: unknown; payment_method?: unknown };
    if (typeof body.order_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.order_id)) {
      return jsonResponse({ error: 'A valid order ID is required.' }, 400);
    }
    if (typeof body.payment_method !== 'string' || !(body.payment_method in methodTypes)) {
      return jsonResponse({ error: 'Choose a supported PayMongo payment method.' }, 400);
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
      .select('id, order_number, customer_id, title, price, status, payment_method, payment_status, paymongo_checkout_session_id, paymongo_checkout_url')
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

    const authorizationValue = `Basic ${btoa(`${paymongoSecret}:`)}`;
    if (order.paymongo_checkout_session_id && order.paymongo_checkout_url) {
      const existingResponse = await fetch(
        `https://api.paymongo.com/v2/checkout_sessions/${encodeURIComponent(order.paymongo_checkout_session_id)}`,
        { headers: { Authorization: authorizationValue } },
      );
      if (existingResponse.ok) {
        const existing = asRecord(await existingResponse.json());
        const existingData = asRecord(existing?.data);
        const attributes = asRecord(existingData?.attributes);
        if (attributes?.status === 'active' && typeof attributes.checkout_url === 'string') {
          return jsonResponse({ checkout_url: attributes.checkout_url });
        }
        if (attributes?.status === 'completed') {
          return jsonResponse({ error: 'Payment is being confirmed. Return to the app and refresh shortly.' }, 409);
        }
      } else {
        console.error('Could not check the existing PayMongo checkout session:', existingResponse.status);
      }
    }

    const amount = Math.round(Number(order.price) * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return jsonResponse({ error: 'The order total is invalid for online payment.' }, 400);
    }

    const returnUrl = `pawfectcats://payment-return?order_id=${encodeURIComponent(order.id)}`;
    const createResponse = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      headers: {
        Authorization: authorizationValue,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [{
              name: String(order.title).slice(0, 100),
              amount,
              currency: 'PHP',
              quantity: 1,
            }],
            payment_method_types: [methodTypes[body.payment_method]],
            success_url: returnUrl,
            cancel_url: returnUrl,
            reference_number: order.order_number,
            metadata: { order_id: order.id, customer_id: user.id },
          },
        },
      }),
    });
    const checkoutResult = asRecord(await createResponse.json());
    const checkoutData = asRecord(checkoutResult?.data);
    const checkoutAttributes = asRecord(checkoutData?.attributes);
    const checkoutUrl = checkoutAttributes?.checkout_url;
    const sessionId = checkoutData?.id;
    if (!createResponse.ok || typeof checkoutUrl !== 'string' || typeof sessionId !== 'string') {
      const errors = Array.isArray(checkoutResult?.errors) ? checkoutResult.errors : [];
      const firstError = asRecord(errors[0]);
      const detail = firstError?.detail;
      console.error('PayMongo rejected the checkout-session request:', createResponse.status);
      return jsonResponse({
        error: typeof detail === 'string'
          ? detail
          : 'PayMongo could not start checkout. Confirm the payment method is enabled in your PayMongo account.',
      }, 502);
    }

    const { error: saveError } = await serviceClient
      .from('orders')
      .update({
        paymongo_checkout_session_id: sessionId,
        paymongo_checkout_url: checkoutUrl,
      })
      .eq('id', order.id)
      .eq('customer_id', user.id);
    if (saveError) throw saveError;

    return jsonResponse({ checkout_url: checkoutUrl });
  } catch (error) {
    console.error(
      'Could not create PayMongo checkout:',
      error instanceof Error ? error.message : 'Unexpected server error',
    );
    return jsonResponse({ error: 'Could not start secure checkout. Please try again.' }, 500);
  }
});
