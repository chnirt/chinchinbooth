import { FRAMES } from "@/constants/assets";

const framesById = new Map(FRAMES.map((frame) => [frame.id, frame]));

export function getFrameLayout(frameId: string | null, count: number) {
  if (!frameId) return undefined;
  return framesById
    .get(frameId)
    ?.layouts.find((layout) => layout.count === count);
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
