import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function GET(request) {
    try {
        const cookieStore = cookies();
        const Token = cookieStore.get('Token')?.value;

        if (!Token) {
            return NextResponse.json(
                { error: 'No hay token de acceso' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const Galpon = searchParams.get('Galpon');

        if (!Galpon) {
            return NextResponse.json(
                { error: 'El parámetro Galpon es requerido' },
                { status: 400 }
            );
        }

        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Rutinas/LotesGalpon?Galpon=${encodeURIComponent(Galpon)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Token': Token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.Mensaje || 'Error al obtener los lotes del galpón' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
