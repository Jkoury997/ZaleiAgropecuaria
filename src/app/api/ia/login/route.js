import { NextResponse } from 'next/server';
import { iaApiClient } from '../client';

/**
 * POST /api/ia/login
 * Endpoint para autenticarse en la API de IA usando credenciales fijas
 * Este endpoint se puede llamar para refrescar el token de IA
 */
export async function POST(request) {
  try {
    // Llamar al servicio de login con credenciales fijas
    const response = await iaApiClient.login();

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error 
        },
        { status: response.status || 401 }
      );
    }
    
    // Devolver la respuesta con el token
    return NextResponse.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error('Error en login IA:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
