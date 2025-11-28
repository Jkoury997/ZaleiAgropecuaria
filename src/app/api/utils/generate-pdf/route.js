import { jsPDF } from 'jspdf';

export async function POST(req) {
    const { content } = await req.json();

    // Crea un nuevo PDF
    const doc = new jsPDF();

    // Agrega el contenido al PDF
    doc.text(content, 10, 10);

    // Genera el PDF como un array buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Envía el PDF como una respuesta binaria
    return new Response(Buffer.from(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=generated.pdf',
        },
        status: 200
    });
}
