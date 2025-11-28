import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function POST(req) {
    try {
        const { Fullcode, Codebar } = await req.json();
        const cookieStore = cookies();
        const Token = cookieStore.get("Token");

        const params = new URLSearchParams();
        if (Codebar) {
            params.append('Codebar', Codebar);
        }
        if (Fullcode) {
            params.append('Fullcode', Fullcode);
        }

        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Catalogo/Articulos?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Token': Token.value
            }
        });

        const responseData = await response.json();

        if (response.ok) {
            return NextResponse.json(responseData);
        } else {
            return NextResponse.json({ error: responseData.Mensaje }, { status: response.status });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Error during data retrieval' }, { status: 500 });
    }
}
