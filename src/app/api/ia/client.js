// Configuración y utilidades para la API de IA
const IA_API_URL = process.env.NEXT_PUBLIC_IA_API_URL || 'https://ia-mws.ingeniar.com.ar/';

// Credenciales fijas para la API de IA
const IA_API_CREDENTIALS = {
  name: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  password: '7895d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
};

/**
 * Cliente HTTP para la API de IA
 */
class IAApiClient {
  constructor(baseURL = IA_API_URL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * Setter para el token de autenticación
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Getter para el token
   */
  getToken() {
    return this.token;
  }

  /**
   * Método genérico para hacer peticiones HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('[IAClient] Request - URL:', url);
    console.log('[IAClient] Request - Method:', options.method || 'GET');
    console.log('[IAClient] Request - Token presente:', !!this.token);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token si existe
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      console.log('[IAClient] Request - Enviando fetch...');
      const response = await fetch(url, config);
      console.log('[IAClient] Request - Response status:', response.status);
      
      const data = await response.json();
      console.log('[IAClient] Request - Response data:', data);

      if (!response.ok) {
        console.log('[IAClient] Request - Error HTTP:', response.status);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('[IAClient] Request - Exitoso');
      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('[IAClient] Request - Error:', error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Login - Autenticación en la API
   * Usa las credenciales fijas de la API
   */
  async login() {
    const response = await this.request('v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(IA_API_CREDENTIALS),
    });

    // Si el login es exitoso, guardar el token
    if (response.success && response.data.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  /**
   * Obtener token de IA (hace login automáticamente si no hay token)
   */
  async getIAToken() {
    if (!this.token) {
      const loginResponse = await this.login();
      if (!loginResponse.success) {
        throw new Error('Error al autenticar con la API de IA');
      }
    }
    return this.token;
  }

  /**
   * Analizar imagen
   */
  async analyzeImage(imageBase64) {
    console.log('[IAClient] analyzeImage - Iniciando análisis');
    console.log('[IAClient] analyzeImage - Longitud de imagen:', imageBase64?.length || 0);
    console.log('[IAClient] analyzeImage - Token presente:', !!this.token);
    
    const bodyToSend = {
      system_role: "Eres un analizador de imágenes. Tu tarea es identificar números en la imagen proporcionada. La imagen puede contener un contador o display digital mostrando una cantidad en kilogramos (KG). Responde únicamente con un JSON con la clave 'peso_kg' y el valor numérico identificado.",
      user_query: "Analiza la imagen y dime la cantidad mostrada en KG.",
      openai_model: "gpt-4o-mini",
      function_descriptions: [
        {
          type: "function",
          function: {
            name: "set_peso_kg",
            description: "Devuelve la cantidad en kilogramos identificada en la imagen",
            parameters: {
              type: "object",
              properties: {
                peso_kg: {
                  type: "number",
                  description: "Cantidad en kilogramos mostrada en el contador o display"
                }
              },
              required: ["peso_kg"]
            }
          }
        }
      ],
      img_b4: imageBase64
    };
    
    console.log('[IAClient] analyzeImage - Body a enviar (keys):', Object.keys(bodyToSend));
    console.log('[IAClient] analyzeImage - Imagen comienza con:', imageBase64?.substring(0, 50));
    
    const result = await this.request('analyze/img', {
      method: 'POST',
      body: JSON.stringify(bodyToSend),
    });
    
    console.log('[IAClient] analyzeImage - Resultado:', result);
    return result;
  }
}

// Exportar instancia singleton
export const iaApiClient = new IAApiClient();

// Exportar clase para crear instancias personalizadas
export default IAApiClient;
