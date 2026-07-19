import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Aquí irá la lógica de checkout (Stripe)
    const body = await request.json();
    
    return NextResponse.json({ message: 'Checkout API endpoint reached successfuly' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Checkout error' }, { status: 500 });
  }
}
