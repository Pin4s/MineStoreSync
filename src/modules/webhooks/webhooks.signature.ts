import { createHmac, timingSafeEqual } from "node:crypto";
import z from "zod";

export const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000

// The docs only say "Unix timestamp". Values this large are milliseconds, smaller ones seconds.
const MILLISECONDS_THRESHOLD = 1_000_000_000_000

export const signatureHeadersSchema = z.object({
    "x-centralcart-signature": z.string().regex(/^[a-f0-9]{64}$/i),
    "x-centralcart-timestamp": z.string().regex(/^\d{1,16}$/),
})

export type SignatureCheck = "valid" | "invalid_headers" | "expired" | "mismatch"

interface SignatureInput {
    headers: unknown
    rawBody: Buffer
    secret: string
    now: Date
}

function timestampToMs(timestamp: string) {
    const value = Number(timestamp)
    return value >= MILLISECONDS_THRESHOLD ? value : value * 1000
}

// Central Cart signs `${timestamp}.${body}` with HMAC-SHA256 (hex). The body here is the exact
// bytes received, so re-serialization differences can never break or fake a match.
function expectedSignature(timestamp: string, rawBody: Buffer, secret: string) {
    return createHmac("sha256", secret)
        .update(`${timestamp}.`)
        .update(rawBody)
        .digest()
}

export function verifyWebhookSignature({ headers, rawBody, secret, now }: SignatureInput): SignatureCheck {
    const parsed = signatureHeadersSchema.safeParse(headers)
    if (!parsed.success) return "invalid_headers"

    const timestamp = parsed.data["x-centralcart-timestamp"]
    if (Math.abs(now.getTime() - timestampToMs(timestamp)) > SIGNATURE_TOLERANCE_MS) return "expired"

    const received = Buffer.from(parsed.data["x-centralcart-signature"], "hex")
    const expected = expectedSignature(timestamp, rawBody, secret)

    // timingSafeEqual throws on different lengths, so that case is rejected before calling it.
    if (received.length !== expected.length) return "mismatch"

    return timingSafeEqual(received, expected) ? "valid" : "mismatch"
}
