import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();

        // Eliminación de cookies
        cookieStore.set('AccessKey', '', { path: '/', expires: new Date(0) });
        cookieStore.set('Token', '', { path: '/', expires: new Date(0) });
        cookieStore.set('IAToken', '', { path: '/', expires: new Date(0) });

        return NextResponse.json({ 
            success: true,
            clearStorage: true // Señal para limpiar localStorage en el cliente
        });
    } catch (error) {
        // Manejo de errores generales y eliminación de cookies si ocurre un error
        try {
            const cookieStore = cookies();
            cookieStore.set('AccessKey', '', { path: '/', expires: new Date(0) });
            cookieStore.set('Token', '', { path: '/', expires: new Date(0) });
            cookieStore.set('IAToken', '', { path: '/', expires: new Date(0) });
        } catch (innerError) {
            console.error('Error al eliminar cookies:', innerError);
        }

        return NextResponse.json({ error: error.message || 'Error during cookie deletion' }, { status: 500 });
    }
}
