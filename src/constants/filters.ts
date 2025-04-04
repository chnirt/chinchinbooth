// Filter collections organized by category
export const FILTER_COLLECTIONS = {
  normal: [
    {
      id: "normal",
      name: "Normal",
      filter: {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
        saturate: 100,
        hueRotate: 0,
      },
    },
  ],
  classic: [
    {
      id: "mono",
      name: "Mono",
      filter: {
        brightness: 100,
        contrast: 100,
        grayscale: 100,
        sepia: 0,
        saturate: 100,
        hueRotate: 0,
      },
    },
    {
      id: "vintage",
      name: "Vintage",
      filter: {
        brightness: 95,
        contrast: 90,
        grayscale: 10,
        sepia: 40,
        saturate: 80,
        hueRotate: 0,
      },
    },
    {
      id: "noir",
      name: "Noir",
      filter: {
        brightness: 90,
        contrast: 140,
        grayscale: 100,
        sepia: 0,
        saturate: 100,
        hueRotate: 0,
      },
    },
    {
      id: "sepia",
      name: "Sepia",
      filter: {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 80,
        saturate: 100,
        hueRotate: 0,
      },
    },
  ],
  vivid: [
    {
      id: "pop",
      name: "Pop",
      filter: {
        brightness: 110,
        contrast: 120,
        grayscale: 0,
        sepia: 0,
        saturate: 150,
        hueRotate: 0,
      },
    },
    {
      id: "vibrant",
      name: "Vibrant",
      filter: {
        brightness: 115,
        contrast: 125,
        grayscale: 0,
        sepia: 0,
        saturate: 170,
        hueRotate: 0,
      },
    },
    {
      id: "lush",
      name: "Lush",
      filter: {
        brightness: 105,
        contrast: 110,
        grayscale: 0,
        sepia: 0,
        saturate: 160,
        hueRotate: 350,
      },
    },
    {
      id: "neon",
      name: "Neon",
      filter: {
        brightness: 110,
        contrast: 130,
        grayscale: 0,
        sepia: 0,
        saturate: 180,
        hueRotate: 10,
      },
    },
  ],
  warm: [
    {
      id: "sunset",
      name: "Sunset",
      filter: {
        brightness: 105,
        contrast: 110,
        grayscale: 0,
        sepia: 20,
        saturate: 130,
        hueRotate: 350,
      },
    },
    {
      id: "golden",
      name: "Golden",
      filter: {
        brightness: 105,
        contrast: 105,
        grayscale: 0,
        sepia: 30,
        saturate: 120,
        hueRotate: 0,
      },
    },
    {
      id: "amber",
      name: "Amber",
      filter: {
        brightness: 102,
        contrast: 108,
        grayscale: 0,
        sepia: 25,
        saturate: 125,
        hueRotate: 10,
      },
    },
    {
      id: "autumn",
      name: "Autumn",
      filter: {
        brightness: 100,
        contrast: 110,
        grayscale: 0,
        sepia: 25,
        saturate: 120,
        hueRotate: 355,
      },
    },
  ],
  retro: [
    {
      id: "80s",
      name: "80s",
      filter: {
        brightness: 105,
        contrast: 115,
        grayscale: 0,
        sepia: 10,
        saturate: 140,
        hueRotate: 350,
      },
    },
    {
      id: "pixel",
      name: "Pixel",
      filter: {
        brightness: 110,
        contrast: 130,
        grayscale: 0,
        sepia: 5,
        saturate: 120,
        hueRotate: 0,
      },
    },
    {
      id: "vhs",
      name: "VHS",
      filter: {
        brightness: 95,
        contrast: 120,
        grayscale: 0,
        sepia: 15,
        saturate: 110,
        hueRotate: 5,
      },
    },
    {
      id: "y2k",
      name: "Y2K",
      filter: {
        brightness: 110,
        contrast: 115,
        grayscale: 0,
        sepia: 0,
        saturate: 130,
        hueRotate: 5,
      },
    },
  ],
  cinematic: [
    {
      id: "drama",
      name: "Drama",
      filter: {
        brightness: 95,
        contrast: 140,
        grayscale: 0,
        sepia: 0,
        saturate: 110,
        hueRotate: 0,
      },
    },
    {
      id: "film",
      name: "Film",
      filter: {
        brightness: 100,
        contrast: 95,
        grayscale: 15,
        sepia: 10,
        saturate: 90,
        hueRotate: 0,
      },
    },
    {
      id: "fade",
      name: "Fade",
      filter: {
        brightness: 105,
        contrast: 90,
        grayscale: 10,
        sepia: 5,
        saturate: 85,
        hueRotate: 0,
      },
    },
    {
      id: "cinema",
      name: "Cinema",
      filter: {
        brightness: 95,
        contrast: 120,
        grayscale: 5,
        sepia: 5,
        saturate: 90,
        hueRotate: 0,
      },
    },
  ],
  moody: [
    {
      id: "gothic",
      name: "Gothic",
      filter: {
        brightness: 90,
        contrast: 130,
        grayscale: 10,
        sepia: 30,
        saturate: 80,
        hueRotate: 10,
      },
    },
    {
      id: "dusk",
      name: "Dusk",
      filter: {
        brightness: 85,
        contrast: 120,
        grayscale: 20,
        sepia: 20,
        saturate: 70,
        hueRotate: 350,
      },
    },
    {
      id: "twilight",
      name: "Twilight",
      filter: {
        brightness: 88,
        contrast: 125,
        grayscale: 15,
        sepia: 10,
        saturate: 75,
        hueRotate: 5,
      },
    },
    {
      id: "somber",
      name: "Somber",
      filter: {
        brightness: 80,
        contrast: 140,
        grayscale: 30,
        sepia: 10,
        saturate: 60,
        hueRotate: 0,
      },
    },
  ],
  urban: [
    {
      id: "urban",
      name: "Urban",
      filter: {
        brightness: 95,
        contrast: 120,
        grayscale: 10,
        sepia: 20,
        saturate: 110,
        hueRotate: 0,
      },
    },
  ],
  documentary: [
    {
      id: "documentary",
      name: "Documentary",
      filter: {
        brightness: 100,
        contrast: 110,
        grayscale: 20,
        sepia: 10,
        saturate: 100,
        hueRotate: 0,
      },
    },
  ],
  fashion: [
    {
      id: "glamour",
      name: "Glamour",
      filter: {
        brightness: 105,
        contrast: 115,
        grayscale: 0,
        sepia: 5,
        saturate: 120,
        hueRotate: 0,
      },
    },
    {
      id: "runway",
      name: "Runway",
      filter: {
        brightness: 110,
        contrast: 120,
        grayscale: 0,
        sepia: 0,
        saturate: 110,
        hueRotate: 0,
      },
    },
    {
      id: "chic",
      name: "Chic",
      filter: {
        brightness: 100,
        contrast: 105,
        grayscale: 0,
        sepia: 0,
        saturate: 100,
        hueRotate: 0,
      },
    },
    {
      id: "vogue",
      name: "Vogue",
      filter: {
        brightness: 102,
        contrast: 110,
        grayscale: 0,
        sepia: 10,
        saturate: 115,
        hueRotate: 0,
      },
    },
    {
      id: "editorial",
      name: "Editorial",
      filter: {
        brightness: 98,
        contrast: 125,
        grayscale: 0,
        sepia: 8,
        saturate: 105,
        hueRotate: 0,
      },
    },
    {
      id: "avantgarde",
      name: "Avant Garde",
      filter: {
        brightness: 108,
        contrast: 112,
        grayscale: 5,
        sepia: 5,
        saturate: 115,
        hueRotate: 0,
      },
    },
  ],
};
