import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Lógica para suscripción a newsletter o membresía
    const body = await request.json();
    
    return NextResponse.json({ message: 'Subscribe API endpoint reached successfuly' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Subscribe error' }, { status: 500 });
  }
}
