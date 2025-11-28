import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const URL_API_AUTH = process.env.NEXT_PUBLIC_URL_API_AUTH;

export async function POST(req) {
    try {
        const body = await req.json();
        const cookieStore = cookies();

        // Supongamos que el cuerpo de la solicitud incluye el email y password
        const { email, password } = body;

        // Enviar la solicitud de inicio de sesión al backend
        const response = await fetch(`${URL_API_AUTH}/api/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Usuario: email, Password: password })
        });

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.Estado) {
            // Guardar tokens en cookies con una duración de 8 horas
            cookieStore.set('AccessKey', responseData.AccessKey, {
                path: '/',
                maxAge: 28800 // 8 horas en segundos
            });
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje }, { status: 401 });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during login' }, { status: 500 });
    }
}
