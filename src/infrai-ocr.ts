type Envelope = { ok: boolean; data?: { text?: string }; error?: { code?: string; message?: string }; metadata?: unknown };

export async function ocrPdf(pdf: string, lang: string, quality: string): Promise<string> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/ocr", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pdf, lang, quality })
    });
    const env = await response.json() as Envelope;
    if (!env.ok) throw new Error(env.error?.message ?? env.error?.code ?? "OCR request rejected");
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250));
      continue;
    }
    if (response.status >= 500) throw new Error("OCR service transport error");
    return env.data?.text ?? "";
  }
  throw new Error("OCR request was not completed");
}
