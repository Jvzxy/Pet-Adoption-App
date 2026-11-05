import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const callbackToken = Deno.env.get('XENDIT_CALLBACK_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!callbackToken || !supabaseUrl || !serviceRoleKey) {
    console.error('Xendit webhook server configuration is incomplete.');
    return jsonResponse({ error: 'Webhook configuration is incomplete.' }, 503);
  }

  const providedToken = request.headers.get('x-callback-token');
  if (!providedToken || !constantTimeEqual(callbackToken, providedToken)) {
    return jsonResponse({ error: 'Invalid webhook token.' }, 401);
  }

  let event: Record<string, unknown> | null;
  try {
    event = asRecord(await request.json());
  } catch {
    return jsonResponse({ error: 'Invalid webhook payload.' }, 400);
  }

  if (event?.status !== 'PAID') return jsonResponse({ received: true });

  const externalId = event.external_id;
  const invoiceId = event.id;
  const amount = Number(event.paid_amount ?? event.amount);
  if (typeof externalId !== 'string' || typeof invoiceId !== 'string' || !Number.isFinite(amount)) {
    return jsonResponse({ error: 'Paid invoice event is missing its order reference or amount.' }, 400);
  }
  if (event.currency !== 'PHP') return jsonResponse({ error: 'Unexpected invoice currency.' }, 400);

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, price, payment_status, payment_method, xendit_invoice_id')
    .eq('order_number', externalId)
    .in('payment_method', ['xendit_card', 'xendit_gcash', 'xendit_maya'])
    .maybeSingle();

  if (orderError) {
    console.error('Could not find the order for Xendit webhook:', orderError.message);
    return jsonResponse({ error: 'Could not look up the order.' }, 500);
  }
  if (!order) return jsonResponse({ error: 'Order reference was not found.' }, 404);
  if (order.xendit_invoice_id !== invoiceId) {
    return jsonResponse({ error: 'Invoice does not match the order.' }, 409);
  }
  if (Number(order.price) !== amount) {
    return jsonResponse({ error: 'Paid amount does not match the order total.' }, 409);
  }
  if (order.payment_status === 'paid') return jsonResponse({ received: true });

  const { error: updateError } = await serviceClient
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', order.id)
    .eq('payment_status', 'pending');
  if (updateError) {
    console.error('Could not mark the Xendit order as paid:', updateError.message);
    return jsonResponse({ error: 'Could not record payment.' }, 500);
  }

  return jsonResponse({ received: true });
});
