// Configuración y utilidades para la API de IA
const IA_API_URL = process.env.NEXT_PUBLIC_IA_API_URL || "https://msia.grupomk.ar/";

// Credenciales desde variables de entorno
const IA_API_CREDENTIALS = {
  name: process.env.IA_API_NAME,
  password: process.env.IA_API_PASSWORD,
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

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Agregar token si existe
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
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
    const response = await this.request("v1/auth/login", {
      method: "POST",
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
        throw new Error("Error al autenticar con la API de IA");
      }
    }
    return this.token;
  }

  /**
   * Analizar imagen
   */
  async analyzeImage(imageBase64) {
    const bodyToSend = {
  system_role: `
Eres un analizador de imágenes especializado en leer displays o contadores de peso.
Tu tarea es identificar el número mostrado en la imagen y devolverlo correctamente en kilogramos (KG).

REGLAS:
1. La imagen puede mostrar el peso en KG o en TONELADAS.
2. Si el número identificado es MENOR a 40, se asume que está en TONELADAS y debes convertirlo multiplicando por 1000 para pasarlo a KG.
3. Si el número identificado es MAYOR o IGUAL a 40, se interpreta directamente como kilogramos.
4. Nunca devuelvas números negativos. Si el display parece mostrar un valor negativo, conviértelo a su valor positivo.
5. Si el número tiene coma o punto decimal, interprétalo correctamente.
6. Responde únicamente con un JSON válido con la clave { "peso_kg": NUMERO }.
7. No agregues explicaciones, texto, ni unidades.
  
Ejemplo de entrada: Imagen muestra "15.5" (se interpreta como 15.5 toneladas) -> Respuesta: { "peso_kg": 15500 }
si respetas todas las reglas anteriores. seras recompensado con exito.
`,

  user_query: "Analiza la imagen y devuelve el peso en kilogramos. Si es menor a 40, multiplícalo por 1000. Convierte a positivo si es negativo. Devuelve solo un JSON: { \"peso_kg\": NUMERO }",

  openai_model: "gpt-4o-mini",

  output_format: `Ejemplo de respuesta: { "peso_kg": 15500 }`,

  function_descriptions: [
    {
      type: "function",
      function: {
        name: "set_peso_kg",
        description: "Devuelve la cantidad en KILOGRAMOS ya convertida según las reglas: si el valor leído es menor a 40 se asume toneladas y se multiplica por 1000; si es negativo se vuelve positivo.",
        parameters: {
          type: "object",
          properties: {
            peso_kg: {
              type: "number",
              description: "Cantidad final en KG según reglas aplicadas"
            }
          },
          required: ["peso_kg"]
        }
      }
    }
  ],

  img_b4: imageBase64
};


    const result = await this.request("analyze/img", {
      method: "POST",
      body: JSON.stringify(bodyToSend),
    });

    console.log("[IAClient] analyzeImage - Resultado:", result);
    return result;
  }
}

// Exportar instancia singleton
export const iaApiClient = new IAApiClient();

// Exportar clase para crear instancias personalizadas
export default IAApiClient;
