// app/api/debug-env/route.js
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_EMPRESA: process.env.NEXT_PUBLIC_EMPRESA,
    NEXT_PUBLIC_EMPRESA_NAME: process.env.NEXT_PUBLIC_EMPRESA_NAME,
    NEXT_PUBLIC_URL_API_AUTH: process.env.NEXT_PUBLIC_URL_API_AUTH,
    NEXT_PUBLIC_URL_API_AVICOLA: process.env.NEXT_PUBLIC_URL_API_AVICOLA,
    NIXPACKS_NODE_VERSION: process.env.NIXPACKS_NODE_VERSION,
  })
}
