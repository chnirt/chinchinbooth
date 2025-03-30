import { Frame } from "@/types";

// Available frames
export const FRAMES: Frame[] = [
  {
    id: "none",
    name: "No Frame",
    layouts: [
      { count: 4, overlayUrl: null, backgroundUrl: null },
      { count: 8, overlayUrl: null, backgroundUrl: null },
    ],
  },
  {
    id: "good-vibes",
    name: "Good vibes",
    layouts: [
      {
        count: 4,
        overlayUrl: "/good-vibes/4/overlay.png",
        backgroundUrl: "/good-vibes/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/good-vibes/8/overlay.png",
        backgroundUrl: "/good-vibes/8/bg.png",
      },
    ],
  },
  {
    id: "pretty-girl",
    name: "Pretty Girl",
    layouts: [
      {
        count: 4,
        overlayUrl: "/pretty-girl/4/overlay.png",
        backgroundUrl: "/pretty-girl/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/pretty-girl/8/overlay.png",
        backgroundUrl: "/pretty-girl/8/bg.png",
      },
    ],
  },
  {
    id: "summer",
    name: "Summer",
    layouts: [
      {
        count: 4,
        overlayUrl: "/summer/4/overlay.png",
        backgroundUrl: "/summer/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/summer/8/overlay.png",
        backgroundUrl: "/summer/8/bg.png",
      },
    ],
  },
  {
    id: "sweet-heart",
    name: "Sweet Heart",
    layouts: [
      {
        count: 4,
        overlayUrl: "/sweet-heart/4/overlay.png",
        backgroundUrl: "/sweet-heart/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/sweet-heart/8/overlay.png",
        backgroundUrl: "/sweet-heart/8/bg.png",
      },
    ],
  },
  {
    id: "film-strip",
    name: "Film Strip",
    layouts: [
      { count: 4, overlayUrl: null, backgroundUrl: "/film-strip/4/bg.png" },
      { count: 8, overlayUrl: null, backgroundUrl: "/film-strip/8/bg.png" },
    ],
  },
  {
    id: "hearts",
    name: "Hearts",
    layouts: [
      {
        count: 4,
        overlayUrl: "/hearts/4/overlay.png",
        backgroundUrl: "/hearts/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/hearts/8/overlay.png",
        backgroundUrl: "/hearts/8/bg.png",
      },
    ],
  },
];
