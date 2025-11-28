import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const Token = cookieStore.get("Token");

        // Extraer IdPallet de la URL de la solicitud
        const { searchParams } = new URL(req.url);
        const IdPallet = searchParams.get('IdPallet');

        if (!IdPallet) {
            return NextResponse.json({ error: 'IdPallet is required' }, { status: 400 });
        }

        // Enviar la solicitud al backend
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Avicola/Pallets/${IdPallet}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Token': Token ? Token.value : ''
            },
        });

        const responseData = await response.json();

        if (response.ok) {
            // Devolver la respuesta en caso de éxito
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje || 'Failed to retrieve pallet' }, { status: response.status });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during data retrieval' }, { status: 500 });
    }
}
