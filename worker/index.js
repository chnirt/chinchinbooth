// OpenNext generates this entry point during pnpm cf:build.
import handler from "../.open-next/worker.js";
import { handleQrRequest } from "./qr-sharing.js";

export { QrQuota } from "./qr-sharing.js";

export default {
  fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/qr" || pathname.startsWith("/s/")) {
      return handleQrRequest(request, env, pathname);
    }
    return handler.fetch(request, env, ctx);
  },
};
