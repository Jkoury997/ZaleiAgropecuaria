# API de Inteligencia Artificial - Documentación

## Estructura

```
src/app/api/ia/
├── client.js              # Cliente HTTP reutilizable
├── init/
│   └── route.js          # Inicialización automática al hacer login
├── login/
│   └── route.js          # Endpoint de autenticación (refresh token)
└── analyze/
    └── img/
        └── route.js      # Endpoint de análisis de imágenes
```

## Flujo de Autenticación

### Automático al Login de Usuario

Cuando un usuario hace login en la aplicación (`/api/jinx/Login`), automáticamente se:
1. Autentica con la API de IA usando credenciales fijas
2. Guarda el token de IA en una cookie (`IAToken`)
3. El token expira en 8 horas (igual que el AccessKey del usuario)

**No necesitas hacer nada manualmente**, el login de IA es transparente.

## Credenciales de IA

Las credenciales están hardcodeadas en `client.js`:
- **api_id**: `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`
- **api_secret**: `7895d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`

## Cliente HTTP (`client.js`)

El cliente HTTP es una clase que encapsula toda la lógica de comunicación con la API de IA.

### Características:
- Singleton pattern para reutilización
- Gestión automática del token JWT
- Manejo de errores centralizado
- Login automático con credenciales fijas

## Endpoints

### 1. Inicializar IA
**POST** `/api/ia/init`

Se llama automáticamente después del login del usuario. No necesitas llamarlo manualmente.

#### Response (Success):
```json
{
  "success": true,
  "data": {
    "iaToken": "jwt_token_here"
  }
}
```

### 2. Analizar Imagen
**POST** `/api/ia/analyze/img`

Analiza una imagen usando IA. El token se obtiene automáticamente de las cookies.

#### Request:
```json
{
  "image": "base64_encoded_image"
}
```

#### Response (Success):
```json
{
  "success": true,
  "data": {
    // Respuesta de la API de IA
  }
}
```

#### Response (Error):
```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

### 3. Refresh Token IA
**POST** `/api/ia/login`

Refresca el token de IA si expira. Normalmente no necesitas llamarlo.

## Uso en el Frontend

```javascript
// El token de IA ya está disponible después del login
// Solo necesitas llamar al endpoint de análisis

const response = await fetch('/api/ia/analyze/img', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: base64Image, // Solo necesitas enviar la imagen
  }),
});

const result = await response.json();

if (result.success) {
  console.log('Análisis:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Variables de Entorno

Opcional en `.env.local`:

```env
NEXT_PUBLIC_IA_API_URL=https://ia-mws.ingeniar.com.ar/
NEXT_PUBLIC_URL=http://localhost:3000  # Para desarrollo
```

## Gestión del Token

- El token de IA se guarda en la cookie `IAToken`
- Expira en 8 horas (igual que el AccessKey del usuario)
- Se renueva automáticamente en cada login
- Se obtiene automáticamente de las cookies en `/api/ia/analyze/img`

## Escalabilidad

Para agregar nuevos endpoints:

1. Agregar el método en `client.js`:
```javascript
async nuevoEndpoint(params) {
  return await this.request('ruta/del/endpoint', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
```

2. Crear el archivo de ruta:
```javascript
// src/app/api/ia/nuevo-endpoint/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { iaApiClient } from '../client';

export async function POST(request) {
  const cookieStore = cookies();
  const iaToken = cookieStore.get('IAToken')?.value;
  
  if (!iaToken) {
    return NextResponse.json({ success: false, error: 'No token' }, { status: 401 });
  }
  
  iaApiClient.setToken(iaToken);
  const response = await iaApiClient.nuevoEndpoint(body);
  
  return NextResponse.json(response);
}
```

## Seguridad

- Las credenciales de IA están en el servidor (no expuestas al cliente)
- El token JWT se guarda en cookies HttpOnly
- El token expira automáticamente en 8 horas
- No se requiere enviar credenciales desde el frontend
