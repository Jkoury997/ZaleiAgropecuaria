import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { iaApiClient } from '../../client';

/**
 * POST /api/ia/analyze/img
 * Endpoint para analizar una imagen
 */
export async function POST(request) {
  try {
    console.log('[AnalyzeImg] Recibiendo request de análisis de imagen');
    const body = await request.json();
    console.log('[AnalyzeImg] Body completo:', body);
    const { image } = body;

    console.log('[AnalyzeImg] Imagen recibida, longitud:', image?.length || 0);

    // Validar que venga la imagen
    if (!image) {
      console.log('[AnalyzeImg] Error: Imagen no proporcionada');
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

    console.log('[AnalyzeImg] Token de IA obtenido de cookie:', iaToken ? 'Presente' : 'Ausente');

    // Si no hay token, intentar hacer login automáticamente
    if (!iaToken) {
      console.log('[AnalyzeImg] No hay token, intentando login automático de IA...');
      try {
        const loginResponse = await iaApiClient.login();
        console.log('[AnalyzeImg] Respuesta de login automático:', loginResponse);
        
        if (loginResponse.success && loginResponse.data?.access_token) {
          iaToken = loginResponse.data.access_token;
          console.log('[AnalyzeImg] Token obtenido del login automático:', iaToken.substring(0, 20) + '...');
          
          // Guardar el token en cookies para futuras peticiones
          cookieStore.set('IAToken', iaToken, {
            path: '/',
            maxAge: 28800 // 8 horas
          });
          console.log('[AnalyzeImg] Token guardado en cookie');
        } else {
          console.log('[AnalyzeImg] Login automático no exitoso. Response:', JSON.stringify(loginResponse));
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
    console.log('[AnalyzeImg] Configurando token en iaApiClient');
    iaApiClient.setToken(iaToken);

    // Llamar al servicio de análisis de imagen
    console.log('[AnalyzeImg] Llamando a iaApiClient.analyzeImage...');
    const response = await iaApiClient.analyzeImage(image);
    console.log('[AnalyzeImg] Respuesta de analyzeImage:', response);

    if (!response.success) {
      console.log('[AnalyzeImg] Análisis no exitoso:', response.error);
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
    console.log('[AnalyzeImg] Cantidad extraída:', cantidad);

    // Devolver la respuesta
    console.log('[AnalyzeImg] Análisis exitoso, data:', response.data);
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
