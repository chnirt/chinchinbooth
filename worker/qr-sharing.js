import { DurableObject } from "cloudflare:workers";
import { maxQrImageBytes } from "../src/lib/qr-limits.ts";

const dayMs = 86_400_000;
const uploadsPerDay = 1000;
const readsPerDay = 20_000;
const rotationDays = 3;
const linkPattern = /^\/s\/(\d{13})-([1-9]\d{0,3})-([a-f0-9]{32})$/;
const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export class QrQuota extends DurableObject {
  reserve(kind, day) {
    const limit = kind === "upload" ? uploadsPerDay : readsPerDay;
    return this.ctx.storage.transactionSync(() => {
      const current = this.ctx.storage.kv.get(kind);
      if (current?.day > day) return null;
      const count = current?.day === day ? current.count : 0;
      if (count >= limit) return null;
      this.ctx.storage.kv.put(kind, { day, count: count + 1 });
      return count + 1;
    });
  }
}

function result(status, text, headers = {}) {
  return new Response(text, { status, headers: { ...privateHeaders, ...headers } });
}

function slotKey(expiresAt, slot) {
  const uploadDay = Math.floor((expiresAt - dayMs) / dayMs);
  // Reuse a bounded set of slots only after every earlier link in that slot has expired.
  return `qr/${uploadDay % rotationDays}/${slot}.jpg`;
}

function retryAfterMidnight() {
  return String(Math.ceil((dayMs - Date.now() % dayMs) / 1000));
}

async function readJpeg(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const buffer = new Uint8Array(maxQrImageBytes);
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.byteLength > maxQrImageBytes - size) {
        await reader.cancel();
        return null;
      }
      buffer.set(value, size);
      size += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  if (size < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8 ||
      buffer[size - 2] !== 0xff || buffer[size - 1] !== 0xd9) return null;
  return buffer.subarray(0, size);
}

export async function handleQrRequest(request, env, pathname) {
  try {
    const quota = env.QR_QUOTA.getByName("qr-usage");
    if (pathname === "/api/qr") {
      if (request.method !== "POST") return result(405, "Method not allowed", { Allow: "POST" });
      if (request.headers.get("Origin") !== new URL(request.url).origin) {
        return result(403, "Forbidden");
      }
      if (request.headers.get("Content-Type") !== "image/jpeg") {
        return result(415, "Expected JPEG");
      }
      if (Number(request.headers.get("Content-Length")) > maxQrImageBytes) {
        return result(413, "JPEG exceeds size limit");
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "local";
      const rate = await env.QR_UPLOAD_RATE.limit({ key: ip });
      if (!rate.success) return result(429, "Upload limit reached", { "Retry-After": "60" });

      const jpeg = await readJpeg(request);
      if (!jpeg) return result(400, "Invalid or oversized JPEG");

      const now = Date.now();
      const slot = await quota.reserve("upload", Math.floor(now / dayMs));
      if (slot === null) return result(429, "Daily upload limit reached", { "Retry-After": retryAfterMidnight() });

      const expiresAt = now + dayMs;
      const token = crypto.randomUUID().replaceAll("-", "");
      await env.QR_IMAGES.put(slotKey(expiresAt, slot), jpeg, {
        customMetadata: { expiresAt: String(expiresAt), token },
      });

      return Response.json({ path: `/s/${expiresAt}-${slot}-${token}`, expiresAt }, {
        status: 201,
        headers: privateHeaders,
      });
    }

    if (request.method !== "GET") return result(405, "Method not allowed", { Allow: "GET" });
    const match = linkPattern.exec(pathname);
    if (!match) return result(404, "Image not found");
    const [, expiry, slot, token] = match;
    const expiresAt = Number(expiry);
    const now = Date.now();
    if (expiresAt <= now) return result(410, "Image expired");
    if (expiresAt > now + dayMs || Number(slot) > uploadsPerDay) return result(404, "Image not found");

    const ip = request.headers.get("CF-Connecting-IP") ?? "local";
    const rate = await env.QR_READ_RATE.limit({ key: ip });
    if (!rate.success) return result(429, "View limit reached", { "Retry-After": "60" });

    if (await quota.reserve("read", Math.floor(now / dayMs)) === null) {
      return result(429, "Daily view limit reached", { "Retry-After": retryAfterMidnight() });
    }
    const image = await env.QR_IMAGES.get(slotKey(expiresAt, slot));
    if (!image || image.customMetadata?.token !== token || image.customMetadata?.expiresAt !== expiry) {
      if (image) await image.body.cancel();
      return result(404, "Image not found");
    }
    if (expiresAt <= Date.now()) {
      await image.body.cancel();
      return result(410, "Image expired");
    }
    return new Response(image.body, {
      headers: {
        ...privateHeaders,
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'inline; filename="chinchinbooth.jpeg"',
        "Content-Length": String(image.size),
      },
    });
  } catch (error) {
    console.error("QR storage unavailable:", error);
    return result(503, "Image sharing unavailable");
  }
}
