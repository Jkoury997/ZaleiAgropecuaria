import { NextResponse } from 'next/server';
import { iaApiClient } from '../client';

/**
 * POST /api/ia/init
 * Endpoint para inicializar la sesión de IA al hacer login en la aplicación
 * Se llama automáticamente después del login exitoso del usuario
 */
export async function POST(request) {
  try {
    // Hacer login en la API de IA con credenciales fijas
    const response = await iaApiClient.login();

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al autenticar con la API de IA' 
        },
        { status: response.status || 401 }
      );
    }
    
    // Devolver el token para guardarlo en el cliente
    return NextResponse.json({
      success: true,
      data: {
        iaToken: response.data.token,
      },
    });

  } catch (error) {
    console.error('Error en init IA:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
