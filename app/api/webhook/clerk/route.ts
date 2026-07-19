import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // webhook de Clerk (Auth)
    // const payload = await request.json();
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Clerk Webhook Error' }, { status: 400 });
  }
}
