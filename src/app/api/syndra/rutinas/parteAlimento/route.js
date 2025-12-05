import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function POST(request) {
    try {
        const cookieStore = cookies();
        const Token = cookieStore.get('Token')?.value;

        if (!Token) {
            return NextResponse.json(
                { error: 'No hay token de acceso' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Rutinas/ParteAlimento`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': Token,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.Mensaje || 'Error al registrar el parte de alimento' },
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
