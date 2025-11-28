import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const URL_API_AUTH = process.env.NEXT_PUBLIC_URL_API_AUTH;

export async function POST(req) {
    try {
        const body = await req.json();
        const cookieStore = cookies();
        const AccessKey = cookieStore.get("AccessKey");
        

        // Supongamos que el cuerpo de la solicitud incluye el email y la empresa
        const { empresa } = body;

        // Enviar la solicitud de acceso al backend
        const response = await fetch(`${URL_API_AUTH}/api/UserAccess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Empresa: empresa, AccessKey: AccessKey.value })
        });

        const responseData = await response.json();

        if (responseData.Estado) {
            // Guardar tokens en cookies solo si Estado es true
            cookieStore.set('Token', responseData.Token, {
                path: '/',
                maxAge: 28800 // 8 horas en segundos
            });
            console.log("AccessKey: ",AccessKey)
            console.log("Token: ",responseData.Token)
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje }, { status: 401 });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during access validation' }, { status: 500 });
    }
}
