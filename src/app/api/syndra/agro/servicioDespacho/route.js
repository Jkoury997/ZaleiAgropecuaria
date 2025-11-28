import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NEXT_PUBLIC_URL_API_AVICOLA = process.env.NEXT_PUBLIC_URL_API_AVICOLA;

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const Token = cookieStore.get("Token");

        // Extraer los parámetros de la URL
        const { searchParams } = req.nextUrl;
        const Id = searchParams.get('Id');
        const Almacen = searchParams.get('Almacen');
        console.log(Id,Almacen)
        if (!Id) {
            return NextResponse.json({ error: 'Id is required' }, { status: 400 });
        }

        if (!Almacen) {
            return NextResponse.json({ error: 'Almacen is required' }, { status: 400 });
        }

        // Enviar la solicitud al backend
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Agro/ServicioDespacho?Asignacion=${Id}&Almacen=${Almacen}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Token': Token ? Token.value : ''
            },
        });

        const responseData = await response.json();

        if (response.ok) {
            // Devolver la respuesta en caso de éxito
            return NextResponse.json(responseData);
        } else {
            // Manejo de errores específicos de la API
            return NextResponse.json({ error: responseData.Mensaje || 'Failed to retrieve servicio Despacho' }, { status: response.status });
        }
    } catch (error) {
        // Manejo de errores generales
        return NextResponse.json({ error: error.message || 'Error during data retrieval' }, { status: 500 });
    }
}


export async function POST(req) {
    
    try {
        const body = await req.json();
        const cookieStore = cookies();
        const Token = cookieStore.get("Token")?.value || '';

        // Extraer los parámetros de la URL
        const { searchParams } = new URL(req.url);
        const Id = searchParams.get('Id');
        const Almacen = searchParams.get('Almacen');

        const {productos } = body;

        console.log(productos)

        if (!Id || !Almacen) {
            return NextResponse.json({ error: 'Id y Almacen son obligatorios' }, { status: 400 });
        }
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return NextResponse.json({ error: 'Lista de productos es requerida' }, { status: 400 });
        }


        
         // Construcción del payload para la API externa
         const payload = {
            Asignacion: Id, // Convertimos a número
            Almacen: Almacen,
            Lista: productos.map(producto => ({
                IdArticulo: producto.IdArticulo, 
                Retira: producto.Retira || 0
            }))
        };
         console.log(payload)
        // Llamada a la API externa
        const response = await fetch(`${NEXT_PUBLIC_URL_API_AVICOLA}/api/Agro/ServicioDespachar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Token": Token
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        console.log("OK = ", responseData)

        if (!response.ok) {
            console.log(responseData)
            return NextResponse.json(
                { error: responseData.Mensaje || "Error al procesar el retiro" },
                { status: response.status }
            );
        }

        // Retornar la respuesta exitosa
        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
