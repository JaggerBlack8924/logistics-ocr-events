import assert from "node:assert/strict";
import { classifyDocument } from "./shipment.js";

const event = classifyDocument("SHP-1", "Driver reported damaged carton at dock");
assert.equal(event.type, "exception");
assert.equal(event.shipmentId, "SHP-1");
console.log("classification test passed");
