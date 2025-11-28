import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 40 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf"];

// Sanitiza proveedor: solo letras, números, guiones y guion bajo
function sanitizeProvider(str = "") {
  const clean = String(str).trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  if (!clean) throw new Error("Proveedor inválido.");
  return clean;
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const providerRaw = form.get("provider");

    if (!file) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
    if (!providerRaw) return NextResponse.json({ error: "Falta el proveedor." }, { status: 400 });

    // Validaciones
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Solo se permiten PDF." }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "El PDF supera el límite de 40 MB." }, { status: 413 });
    }

    const provider = sanitizeProvider(providerRaw);

    // Estructura: /uploads/{provider}/
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const providerDir = path.join(uploadsRoot, provider);

    // Asegurar carpetas
    try { await stat(providerDir); } catch { await mkdir(providerDir, { recursive: true }); }

    // Nombre único
    const original = (file.name || "documento.pdf").replace(/[^\w.-]+/g, "_");
    const ext = path.extname(original).toLowerCase() || ".pdf";
    const base = path.basename(original, ext);
    const unique = crypto.randomBytes(8).toString("hex");
    const filename = `${base}-${unique}${ext}`;

    const filePath = path.join(providerDir, filename);
    await writeFile(filePath, buffer);

    // URL pública a través de la ruta GET
    const publicUrl = `/api/upload/${provider}/${filename}`;

    return NextResponse.json({
      ok: true,
      provider,
      filename,
      url: publicUrl,
      message: `PDF guardado en carpeta del proveedor "${provider}".`
    });
  } catch (err) {
    console.error("Upload error:", err);
    const msg = err?.message?.includes("Proveedor inválido") ? err.message : "Error al guardar el PDF.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
