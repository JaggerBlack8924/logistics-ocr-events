import { shipmentRequest, classifyDocument } from "./shipment.js";
import { ocrPdf } from "./infrai-ocr.js";

export async function processShipment(input: unknown) {
  const request = shipmentRequest.parse(input);
  const text = await ocrPdf(request.document, request.lang, request.quality);
  return classifyDocument(request.shipmentId, text);
}

if (process.argv[1]?.endsWith("ocr-shipment.ts")) {
  const input = {
    shipmentId: "SHP-2048",
    document: process.env.SAMPLE_PDF ?? "JVBERi0xLjEKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMTQ0XSA+PgplbmRvYmoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRgo=",
    lang: "eng",
    quality: "high"
  };
  processShipment(input).then(console.log).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
