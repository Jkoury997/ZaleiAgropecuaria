import { NextResponse } from 'next/server';

const NEXT_PUBLIC_IA_API_URL = process.env.NEXT_PUBLIC_IA_API_URL;

export async function GET() {
  if (!NEXT_PUBLIC_IA_API_URL) {
    return NextResponse.json(
      { error: 'No NEXT_PUBLIC_IA_API_URL found' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_IA_API_URL}/hello`, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text }; // 👉 acá vas a ver { message: "Koury IA Analyzer mWS 1.0" }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.Mensaje || data?.message || 'Error en la API IA' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error en /api/ia/hello:', error);
    return NextResponse.json(
      { error: error.message || 'Error during data retrieval' },
      { status: 500 }
    );
  }
}
