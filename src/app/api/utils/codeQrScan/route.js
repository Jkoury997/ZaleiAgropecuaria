import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/scannedQRCodes.json');

const ensureFileExists = () => {
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ codes: [] }, null, 2));
  }
};

const cleanExpiredCodes = () => {
  ensureFileExists();
  const jsonData = fs.readFileSync(filePath);
  const { codes } = JSON.parse(jsonData);

  const now = new Date();
  const updatedCodes = codes.filter(({ timestamp }) => (now - new Date(timestamp)) / (1000 * 60 * 60 * 24) < 4);

  fs.writeFileSync(filePath, JSON.stringify({ codes: updatedCodes }, null, 2));
};

export async function POST(request) {
  cleanExpiredCodes();

  const { qrCode } = await request.json();
  const parsedQRCode = JSON.parse(qrCode);

  const jsonData = fs.readFileSync(filePath);
  const { codes } = JSON.parse(jsonData);

  if (codes.some(code => code.uuid === parsedQRCode.uuid)) {
    return NextResponse.json({ message: 'El código QR ya ha sido escaneado.' }, { status: 400 });
  } else {
    const newCode = {
      uuid: parsedQRCode.uuid,
      IdArticulo: parsedQRCode.IdArticulo,
      FullCode:parsedQRCode.FullCode,
      Cantidad: parsedQRCode.Cantidad,
      timestamp: new Date().toISOString()
    };
    codes.push(newCode);
    fs.writeFileSync(filePath, JSON.stringify({ codes }, null, 2));
    return NextResponse.json(newCode, { status: 200 });
  }
}

export async function DELETE(request) {
  ensureFileExists();
  
  const { uuid } = await request.json();

  const jsonData = fs.readFileSync(filePath);
  const { codes } = JSON.parse(jsonData);

  const updatedCodes = codes.filter(code => code.uuid !== uuid);

  fs.writeFileSync(filePath, JSON.stringify({ codes: updatedCodes }, null, 2));
  
  return NextResponse.json({ message: 'QR code deleted successfully' }, { status: 200 });
}