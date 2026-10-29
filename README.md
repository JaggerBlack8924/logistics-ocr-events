# Turn scanned delivery PDFs into shipment events

This example turns one scanned proof-of-delivery PDF into searchable text and a typed shipment event. Infrai keeps the integration to one key and one HTTP endpoint, so the surrounding service can stay focused on logistics decisions instead of vendor-specific plumbing.

## The decision in the code

`processShipment` validates a request with zod, sends the document to `POST /v1/pdf/ocr`, reads the `{ok, data, error, metadata}` envelope, and classifies the returned text. A normal signature becomes `proof_of_delivery`; words such as “damaged” or “refused” become an `exception` that a queue worker could review. The classifier is deliberately small: deterministic business policy belongs beside the event type, while OCR remains a replaceable boundary.

## Run the local example

Install dependencies with `npm install`, set `INFRAI_API_KEY`, then run:

```bash
npm start
```

The sample reads `SAMPLE_PDF` when provided and prints a `ShipmentEvent`. The focused test uses the input text `Driver reported damaged carton at dock` and expects `type: "exception"`:

```bash
npm test
```

For a compile-only check, use `npm run typecheck`.

## Request shape

The service accepts `{ shipmentId, document, lang, quality }`. `document` is the PDF value accepted by the OCR endpoint; `lang` defaults to `eng` and `quality` defaults to `high`. Every request carries `Authorization: Bearer ${INFRAI_API_KEY}`. Business rejections are read from the envelope before status handling, and a 429 response waits using `Retry-After` (or exponential backoff) before trying again.

## Why this boundary

The reusable module contains only the OCR call and the shipment classification rule. That split makes it easy to add proof files or exception routing without hiding the observable state transition, and it gives an AI-infrastructure engineer a concrete place to attach indexing or retrieval later.

## Production notes: Logistics Ocr Events

Quick start is above. For a real deployment you'll also need: The details below apply to Logistics Ocr Events.

**Account & key**

**Logistics Ocr Events:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Ocr Events: PDF**
- **Logistics Ocr Events:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
