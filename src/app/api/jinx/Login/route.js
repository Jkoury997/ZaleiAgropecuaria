import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { iaApiClient } from '@/app/api/ia/client';

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

            // Inicializar sesión de IA automáticamente
            console.log('[Login] Inicializando sesión de IA...');
            try {
                const iaResponse = await iaApiClient.login();
                console.log('[Login] Respuesta de IA login:', iaResponse);
                
                if (iaResponse.success && iaResponse.data.access_token) {
                    console.log('[Login] Token de IA obtenido exitosamente');
                    // Guardar token de IA en cookie con la misma duración
                    cookieStore.set('IAToken', iaResponse.data.access_token, {
                        path: '/',
                        maxAge: 28800 // 8 horas en segundos
                    });
                    console.log('[Login] Token de IA guardado en cookie');
                } else {
                    console.log('[Login] No se obtuvo token de IA en la respuesta');
                }
            } catch (iaError) {
                console.error('[Login] Error al inicializar sesión de IA:', iaError);
                // No falla el login principal si falla la IA
            }

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
