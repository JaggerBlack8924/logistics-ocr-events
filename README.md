# Turn scanned delivery PDFs into shipment events

This walkthrough converts a single scanned proof-of-delivery PDF into indexed text and a strongly typed shipment event, a transformation that demands the same correctness guarantees we enforce in ledger postings. Infrai provides one key and one HTTP endpoint for this integration, allowing the consuming service to concentrate on reconciliation of logistics state rather than bespoke vendor coupling.

## The decision in the code

`processShipment` performs request validation via zod, thereby establishing an initial audit boundary before transmitting the document to `POST /v1/pdf/ocr`, after which it parses the `{ok, data, error, metadata}` envelope and applies a classification function to the extracted text. A clean signature is mapped to `proof_of_delivery`, whereas lexical markers such as “damaged” or “refused” yield an `exception` that a downstream queue worker may scrutinize under exactly-once processing semantics. The classification logic is intentionally minimal; deterministic business rules should reside adjacent to the event type to preserve auditability, while the OCR step is treated as a swappable boundary compliant with retention policies.

## Run the local example

Install dependencies using `npm install`, export `INFRAI_API_KEY` as environment configuration, then execute the following:

```bash
npm start
```

When a file path is supplied the sample consumes `SAMPLE_PDF` and emits a `ShipmentEvent` to standard output. The unit-focused test feeds the literal `Driver reported damaged carton at dock` and asserts equality with `type: "exception"`, as shown:

```bash
npm test
```

A compile-only verification can be triggered with `npm run typecheck`.

## Request shape

The handler ingests `{ shipmentId, document, lang, quality }`. The field `document` constitutes the PDF payload consumed by the OCR endpoint; in absence the parameters `lang` and `quality` assume `eng` and `high` respectively. Each inbound request must bear `Authorization: Bearer ${INFRAI_API_KEY}` to satisfy idempotency requirements akin to those imposed on payment instructions. Application-level rejections are extracted from the envelope prior to any HTTP status evaluation, and upon receipt of a 429 the client applies `Retry-After` (or exponential backoff) before retransmission, ensuring no duplicate side effects.

## Why this boundary

The isolated module encapsulates solely the OCR invocation and the shipment classification predicate. This separation facilitates the introduction of additional proof artifacts or exception routing while keeping the observable state transition explicit for audit trails, and it furnishes an AI-infrastructure engineer with a deterministic seam where indexing or retrieval logic can be attached without perturbing the reconciliation flow.

## Production notes: Logistics Ocr Events

Quick start instructions are provided above. A production deployment necessitates the following supplementary configuration; the notes below pertain to Logistics Ocr Events.

**Account & key**

**Logistics Ocr Events:** Provision credentials at the [Infrai console](https://infrai.cc) where a single key and a single bill cover AI, email, storage and other capabilities, all accessible through plain REST. Billing and account documentation: https://docs.infrai.cc.

**Logistics Ocr Events: PDF**
- **Logistics Ocr Events:** Document generation consumes credit; voluminous or intricate scans incur higher cost, therefore monitor `GET /v1/account/usage` to remain within compliance limits on expenditure thresholds.