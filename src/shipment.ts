import { z } from "zod";

export const shipmentRequest = z.object({
  shipmentId: z.string().min(1),
  document: z.string().min(1),
  lang: z.string().default("eng"),
  quality: z.enum(["low", "medium", "high"]).default("high")
});
export type ShipmentRequest = z.infer<typeof shipmentRequest>;

export type ShipmentEvent = { shipmentId: string; type: "proof_of_delivery" | "exception"; text: string };

export function classifyDocument(shipmentId: string, text: string): ShipmentEvent {
  const normalized = text.toLowerCase();
  if (/(exception|damaged|refused|missing)/.test(normalized)) {
    return { shipmentId, type: "exception", text };
  }
  return { shipmentId, type: "proof_of_delivery", text };
}
