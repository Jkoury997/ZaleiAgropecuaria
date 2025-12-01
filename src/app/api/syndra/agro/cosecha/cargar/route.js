import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function POST(req) {
    try {
        const body = await req.json();
        const cookieStore = cookies();
        const Token = cookieStore.get("Token")?.value || '';

        const { Grano, Sementera, Cantidad, Imagen } = body;

        // Validar campos obligatorios
        if (Grano === undefined || Grano === null) {
            return NextResponse.json({ error: 'Grano es obligatorio' }, { status: 400 });
        }
        if (Sementera === undefined || Sementera === null) {
            return NextResponse.json({ error: 'Sementera es obligatoria' }, { status: 400 });
        }
        if (Cantidad === undefined || Cantidad === null) {
            return NextResponse.json({ error: 'Cantidad es obligatoria' }, { status: 400 });
        }

        // Construcción del payload para la API externa
        const payload = {
            Grano,
            Sementera,
            Cantidad,
            Imagen: Imagen || ""
        };

        // Llamada a la API externa
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Cosecha/Cargar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Token": Token
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: responseData.Mensaje || "Error al cargar la cosecha" },
                { status: response.status }
            );
        }

        // Retornar la respuesta exitosa
        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
