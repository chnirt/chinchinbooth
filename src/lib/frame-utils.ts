import { FRAMES } from "@/constants/assets";
import optimizedLayers from "@/constants/frame-assets.json";

const optimizedLayerUrls = new Set(optimizedLayers);

export function frameAssetUrl(url: string, thumbnail = false) {
  if (!optimizedLayerUrls.has(url)) return url;
  const suffix = thumbnail ? ".thumb.webp" : ".webp";
  return `/frame-assets${url.slice(0, -4)}${suffix}`;
}

const framesById = new Map(FRAMES.map((frame) => [frame.id, frame]));

export function getFrameLayout(frameId: string | null, count: number) {
  if (!frameId) return undefined;
  const layout = framesById
    .get(frameId)
    ?.layouts.find((layout) => layout.count === count);
  if (!layout) return undefined;

  return {
    ...layout,
    backgroundUrl: layout.backgroundUrl && frameAssetUrl(layout.backgroundUrl),
    overlayUrl: layout.overlayUrl && frameAssetUrl(layout.overlayUrl),
  };
}

function preloadFrameImage(url: string | null): Promise<void> {
  if (!url) return Promise.resolve();

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve();
    image.onerror = () => {
      console.error(`Failed to preload frame image: ${url}`);
      resolve();
    };
    image.src = url;
  });
}

export async function preloadFrameLayout(
  frameId: string | null,
  count: number,
) {
  const layout = getFrameLayout(frameId, count);
  if (!layout) return;

  await Promise.all([
    preloadFrameImage(layout.backgroundUrl),
    preloadFrameImage(layout.overlayUrl),
  ]);
}
