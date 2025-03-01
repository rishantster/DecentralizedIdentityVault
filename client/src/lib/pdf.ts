import { PDFDocument } from "pdf-lib";

export async function addSignatureToDocument(
  pdfBase64: string,
  signature: { address: string, timestamp: string, position: { x: number, y: number, page: number } }
): Promise<string> {
  const pdfDoc = await PDFDocument.load(pdfBase64);
  const pages = pdfDoc.getPages();
  const page = pages[signature.position.page];
  
  const text = `Signed by ${signature.address}\non ${signature.timestamp}`;
  page.drawText(text, {
    x: signature.position.x,
    y: signature.position.y,
    size: 12
  });

  const modifiedPdfBytes = await pdfDoc.saveAsBase64();
  return modifiedPdfBytes;
}

export function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: "application/pdf" });
}
