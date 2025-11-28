import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function POST(req) {
    console.log("entre")
        const {dataToSend} = await req.json(); 
        console.log(dataToSend)
        const cookieStore = cookies();
        const Token = cookieStore.get("Token");
        console.log(Token.value)
    try {
        
        

        // Enviar la solicitud al backend
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Avicola/Pallet`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Token': Token ? Token.value : ''
            },
            body: JSON.stringify( dataToSend )
        });

        const responseData = await response.json();

        if (response.ok) {
            // Devolver la respuesta en caso de éxito
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje || 'Failed to create pallet' }, { status: response.status });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during data retrieval' }, { status: 500 });
    }
}
