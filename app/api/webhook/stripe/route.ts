import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // webhook de Stripe
    // const payload = await request.text();
    // const sig = request.headers.get('stripe-signature');
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Stripe Webhook Error' }, { status: 400 });
  }
}
