import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { iaApiClient } from '../../client';

/**
 * POST /api/ia/analyze/img
 * Endpoint para analizar una imagen
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { image } = body;

    // Validar que venga la imagen
    if (!image) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'image es requerida (base64)' 
        },
        { status: 400 }
      );
    }

    // Obtener token de IA desde las cookies
    const cookieStore = cookies();
    let iaToken = cookieStore.get('IAToken')?.value;

    // Si no hay token, intentar hacer login automáticamente
    if (!iaToken) {
      try {
        const loginResponse = await iaApiClient.login();
        
        if (loginResponse.success && loginResponse.data?.access_token) {
          iaToken = loginResponse.data.access_token;
          
          // Guardar el token en cookies para futuras peticiones
          cookieStore.set('IAToken', iaToken, {
            path: '/',
            maxAge: 28800 // 8 horas
          });
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: 'No se pudo autenticar con la API de IA' 
            },
            { status: 401 }
          );
        }
      } catch (loginError) {
        console.error('[AnalyzeImg] Error en login automático:', loginError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error al autenticar con la API de IA' 
          },
          { status: 401 }
        );
      }
    }

    // Configurar token en el cliente
    iaApiClient.setToken(iaToken);

    // Llamar al servicio de análisis de imagen
    const response = await iaApiClient.analyzeImage(image);

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error 
        },
        { status: response.status || 500 }
      );
    }

    // Extraer el valor de peso_kg o cantidad_kg del result
    const cantidad = response.data?.result?.peso_kg || response.data?.result?.cantidad_kg;

    // Devolver la respuesta
    return NextResponse.json({
      success: true,
      data: cantidad,
    });

  } catch (error) {
    console.error('Error al analizar imagen:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
