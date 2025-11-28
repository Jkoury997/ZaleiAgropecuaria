import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function POST(req) {
    try {
        // Parsear el cuerpo de la solicitud
        const { IdPallet, AlmacenOrigen, AlmacenDestino } = await req.json(); 
        console.log(IdPallet, AlmacenOrigen, AlmacenDestino )
        // Obtener el token de las cookies
        const cookieStore = cookies();
        const Token = cookieStore.get("Token");

        // Verificar que los datos necesarios estén presentes
        if (!IdPallet || !AlmacenOrigen || !AlmacenDestino) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        // Hacer la solicitud al backend externo para mover el pallet
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Avicola/PalletMover`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Token': Token ? Token.value : ''
            },
            body: JSON.stringify({
                IdPallet,
                AlmacenOrigen,
                AlmacenDestino
            })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log(responseData)
            // Devolver la respuesta en caso de éxito
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje || 'Failed to move pallet' }, { status: response.status });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during data retrieval' }, { status: 500 });
    }
}
