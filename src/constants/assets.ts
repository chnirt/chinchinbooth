import { Frame } from "@/types";

// Available frames
export const FRAMES: Frame[] = [
  {
    id: "none",
    name: "No Frame",
    photostrip: [
      { count: 4, overlayUrl: null, backgroundUrl: null },
      { count: 8, overlayUrl: null, backgroundUrl: null },
    ],
  },
  {
    id: "summer-time",
    name: "Summer Time",
    photostrip: [
      {
        count: 4,
        overlayUrl: "/summer-time/4/overlay.png",
        backgroundUrl: "/summer-time/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/summer-time/8/overlay.png",
        backgroundUrl: "/summer-time/8/bg.png",
      },
    ],
  },
];
