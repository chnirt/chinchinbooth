export interface QrShare {
  url: string;
  expiresAt: number;
}

export async function uploadQrImage(jpeg: Blob): Promise<QrShare> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: jpeg,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`QR upload failed (${response.status})`);

    const { path, expiresAt } = await response.json();
    if (typeof path !== "string" || !/^\/s\/[0-9a-f-]+$/.test(path) || !Number.isSafeInteger(expiresAt)) {
      throw new Error("QR upload did not return a share link");
    }
    return { url: new URL(path, window.location.origin).href, expiresAt };
  } finally {
    clearTimeout(timeout);
  }
}
