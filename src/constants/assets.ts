import { StickerLayout } from "@/types";

// Available frames
export const FRAMES = [
  { id: "none", name: "No Frame", url: null },
  {
    id: "birthday",
    name: "Birthday",
    url: "/birthday-frame-removebg-preview.png",
  },
  {
    id: "party",
    name: "Party",
    url: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "hearts",
    name: "Hearts",
    url: "/placeholder.svg?height=400&width=400",
  },
];

// Pre-designed sticker layouts
export const STICKER_LAYOUTS: StickerLayout[] = [
  {
    id: "none",
    name: "No Stickers",
    stickers: [],
  },
  {
    id: "kimchi-hamster",
    name: "Kimchi Hamster",
    stickers: [
      {
        url: "/stickers/kimchi-hamster/in-love.png",
        positions: [{ x: 14, y: 4, rotation: 0, scale: 0.5 }],
      },
      {
        url: "/stickers/kimchi-hamster/love-6.png",
        positions: [{ x: 88, y: 21, rotation: 0, scale: 0.4 }],
      },
      {
        url: "/stickers/kimchi-hamster/love-2.png",
        positions: [{ x: 13, y: 44, rotation: 0, scale: 0.4 }],
      },
      {
        url: "/stickers/kimchi-hamster/love-5.png",
        positions: [{ x: 88, y: 64, rotation: 0, scale: 0.4 }],
      },
      {
        url: "/stickers/kimchi-hamster/love-7.png",
        positions: [{ x: 12, y: 84, rotation: 0, scale: 0.4 }],
      },
      {
        url: "/stickers/kimchi-hamster/love-1.png",
        positions: [{ x: 70, y: 95, rotation: 0, scale: 1 }],
      },
    ],
  },
];
