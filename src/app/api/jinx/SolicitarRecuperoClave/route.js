import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const URL_API_AUTH = process.env.NEXT_PUBLIC_URL_API_AUTH;

export async function POST(req) {
    try {
        const body = await req.json();
        
        // Supongamos que el cuerpo de la solicitud incluye el email
        const { email } = body;

        // Enviar la solicitud de recuperación de clave al backend
        const response = await fetch(`${URL_API_AUTH}/api/SolicitaRecuperoClave?Email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();

        if (responseData.Estado) {
            console.log(responseData.Mensaje)
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje }, { status: 401 });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during password recovery' }, { status: 500 });
    }
}
