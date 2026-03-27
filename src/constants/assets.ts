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
    id: "love-song",
    name: "Love Song",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/love-song/4/overlay.png",
        // backgroundUrl: "/love-song/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774584207/chinchinbooth/love-song/4/hfdysyk15cnqctmrgjjv.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774584173/chinchinbooth/love-song/4/os08lqz9xkwjumt7huu2.png",
      },
      {
        count: 8,
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774584248/chinchinbooth/love-song/8/ehog9bzm4y1bshamg4wv.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774584234/chinchinbooth/love-song/8/wibxluuvckfaxlhai3ac.png",
      },
    ],
    isNew: true,
  },
  {
    id: "arirang",
    name: "Arirang",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/arirang/4/overlay.png",
        // backgroundUrl: "/arirang/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774583772/chinchinbooth/arirang/4/sdrrnsxcwxlexlj84vzg.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774583768/chinchinbooth/arirang/4/kuknvxluw0yvyp1r4pmy.png",
      },
      {
        count: 8,
        // overlayUrl: "/arirang/8/overlay.png",
        // backgroundUrl: "/arirang/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774583819/chinchinbooth/arirang/8/x7ffoxloo0duf72wcfcl.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774583816/chinchinbooth/arirang/8/v0jz3bkyadqh787vtzsh.png",
      },
    ],
    isNew: true,
  },
  // {
  //   id: "hpny",
  //   name: "Happy New Year",
  //   layouts: [
  //     {
  //       count: 4,
  //       overlayUrl: "/hpny/4/overlay.png",
  //       backgroundUrl: "/hpny/4/bg.png",
  //     },
  //     {
  //       count: 8,
  //       overlayUrl: "/hpny/8/overlay.png",
  //       backgroundUrl: "/hpny/8/bg.png",
  //     },
  //   ],
  //   isNew: true,
  // },
  {
    id: "sweet-air",
    name: "Sweet Air",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/sweet-air/4/overlay.png",
        // backgroundUrl: "/sweet-air/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597246/chinchinbooth/sweet-air/4/j1q1iqi6dhochd6tjdn9.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597239/chinchinbooth/sweet-air/4/cj5icanj9yzzcuan9jlz.png",
      },
      {
        count: 8,
        // overlayUrl: "/sweet-air/8/overlay.png",
        // backgroundUrl: "/sweet-air/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597261/chinchinbooth/sweet-air/8/xla8nqqi9alf4lhot0xp.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597255/chinchinbooth/sweet-air/8/jeg7scinwknspujoapif.png",
      },
    ],
    isNew: true,
  },
  {
    id: "love-ticket",
    name: "Love Ticket",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/love-ticket/4/overlay.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597346/chinchinbooth/love-ticket/4/mkvlglh9vhpzygqxfct9.png",
        backgroundUrl: null,
      },
      {
        count: 8,
        // overlayUrl: "/love-ticket/8/overlay.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597354/chinchinbooth/love-ticket/8/zmyreav6izqgzyrn6fgh.png",
        backgroundUrl: null,
      },
    ],
    isNew: true,
  },
  {
    id: "february-love",
    name: "February Love",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/february-love/4/overlay.png",
        // backgroundUrl: "/february-love/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597421/chinchinbooth/february-love/4/r1kei84mhvm4ky2blse3.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597417/chinchinbooth/february-love/4/dqfuycl5ekj4n8f8auhz.png",
      },
      {
        count: 8,
        // overlayUrl: "/february-love/8/overlay.png",
        // backgroundUrl: "/february-love/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597433/chinchinbooth/february-love/8/uisjuuf5elcln3ch5q9a.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597428/chinchinbooth/february-love/8/yoejiemv5kyu1n7ukmbv.png",
      },
    ],
    isNew: true,
  },
  {
    id: "pixel-chic",
    name: "Pixel Chic",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/pixel-chic/4/overlay.png",
        // backgroundUrl: "/pixel-chic/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597570/chinchinbooth/pixel-chic/4/mroa8jhqcf3jct4svbxv.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597566/chinchinbooth/pixel-chic/4/xq7hl7tpquohkz0tsicl.png",
      },
      {
        count: 8,
        // overlayUrl: "/pixel-chic/8/overlay.png",
        // backgroundUrl: "/pixel-chic/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597587/chinchinbooth/pixel-chic/8/qsf14v8su6vmftvwztwy.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597582/chinchinbooth/pixel-chic/8/pl9kaiyokjuvfxzpcoli.png",
      },
    ],
    isNew: true,
  },
  {
    id: "true-love",
    name: "True Love",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/true-love/4/overlay.png",
        // backgroundUrl: "/true-love/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597698/chinchinbooth/true-love/4/sui4feee6ajnvyiukna1.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597692/chinchinbooth/true-love/4/s0fhsocdjecyrxtjobuk.png",
      },
      {
        count: 8,
        // overlayUrl: "/true-love/8/overlay.png",
        // backgroundUrl: "/true-love/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597710/chinchinbooth/true-love/8/b0c1lnwtvgeep0ljtwoy.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597704/chinchinbooth/true-love/8/ryoqzllc1l9gqfktaesp.png",
      },
    ],
  },
  {
    id: "sweet-heart",
    name: "Sweet Heart",
    layouts: [
      {
        count: 4,
        // overlayUrl: "/sweet-heart/4/overlay.png",
        // backgroundUrl: "/sweet-heart/4/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597830/chinchinbooth/sweet-heart/4/swg5sg1gwxrcgorjbesc.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597825/chinchinbooth/sweet-heart/4/afwehphcs4vkedbvdvzj.png",
      },
      {
        count: 8,
        // overlayUrl: "/sweet-heart/8/overlay.png",
        // backgroundUrl: "/sweet-heart/8/bg.png",
        overlayUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597846/chinchinbooth/sweet-heart/8/f5zkvaqbdipzy1ro712g.png",
        backgroundUrl: "https://res.cloudinary.com/chnirt/image/upload/v1774597839/chinchinbooth/sweet-heart/8/jb5st14xrmgx5wkvbk0m.png",
      },
    ],
  },
  {
    id: "zootopia",
    name: "Zootopia",
    layouts: [
      {
        count: 4,
        overlayUrl: "/zootopia/4/overlay.png",
        backgroundUrl: "/zootopia/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/zootopia/8/overlay.png",
        backgroundUrl: "/zootopia/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "twinkle-twinkle",
    name: "Twinkle Twinkle",
    layouts: [
      {
        count: 4,
        overlayUrl: "/twinkle-twinkle/4/overlay.png",
        backgroundUrl: "/twinkle-twinkle/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/twinkle-twinkle/8/overlay.png",
        backgroundUrl: "/twinkle-twinkle/8/bg.png",
      },
    ],
    isNew: true,
  },
  // {
  //   id: "christmas-tree",
  //   name: "Christmas Tree",
  //   layouts: [
  //     {
  //       count: 4,
  //       overlayUrl: "/christmas-tree/4/overlay.png",
  //       backgroundUrl: "/christmas-tree/4/bg.png",
  //     },
  //     {
  //       count: 8,
  //       overlayUrl: "/christmas-tree/8/overlay.png",
  //       backgroundUrl: "/christmas-tree/8/bg.png",
  //     },
  //   ],
  //   isNew: true,
  // },
  // {
  //   id: "christmas-snow",
  //   name: "Christmas Snow",
  //   layouts: [
  //     {
  //       count: 4,
  //       overlayUrl: "/christmas-snow/4/overlay.png",
  //       backgroundUrl: "/christmas-snow/4/bg.png",
  //     },
  //     {
  //       count: 8,
  //       overlayUrl: "/christmas-snow/8/overlay.png",
  //       backgroundUrl: "/christmas-snow/8/bg.png",
  //     },
  //   ],
  //   isNew: true,
  // },
  {
    id: "evergreen-bliss",
    name: "Evergreen Bliss",
    layouts: [
      {
        count: 4,
        overlayUrl: "/evergreen-bliss/4/overlay.png",
        backgroundUrl: null,
      },
      {
        count: 8,
        overlayUrl: "/evergreen-bliss/8/overlay.png",
        backgroundUrl: null,
      },
    ],
    isNew: true,
  },
  {
    id: "snowy-scarlet",
    name: "Snowy Scarlet",
    layouts: [
      {
        count: 4,
        overlayUrl: "/snowy-scarlet/4/overlay.png",
        backgroundUrl: "/snowy-scarlet/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/snowy-scarlet/8/overlay.png",
        backgroundUrl: "/snowy-scarlet/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "trick-or-treat",
    name: "Trick Or Treat",
    layouts: [
      {
        count: 4,
        overlayUrl: "/trick-or-treat/4/overlay.png",
        backgroundUrl: "/trick-or-treat/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/trick-or-treat/8/overlay.png",
        backgroundUrl: "/trick-or-treat/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "halloween",
    name: "Halloween",
    layouts: [
      {
        count: 4,
        overlayUrl: "/halloween/4/overlay.png",
        backgroundUrl: "/halloween/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/halloween/8/overlay.png",
        backgroundUrl: "/halloween/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "lanterns",
    name: "Lanterns",
    layouts: [
      {
        count: 4,
        overlayUrl: "/lanterns/4/overlay.png",
        backgroundUrl: "/lanterns/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/lanterns/8/overlay.png",
        backgroundUrl: "/lanterns/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "moon-feast",
    name: "Moon Feast",
    layouts: [
      {
        count: 4,
        overlayUrl: "/moon-feast/4/overlay.png",
        backgroundUrl: "/moon-feast/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/moon-feast/8/overlay.png",
        backgroundUrl: "/moon-feast/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "rouge-étoile",
    name: "Rouge Étoile",
    layouts: [
      {
        count: 4,
        overlayUrl: null,
        backgroundUrl: "/rouge-étoile/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: null,
        backgroundUrl: "/rouge-étoile/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "amethyst-dream",
    name: "Amethyst Dream",
    layouts: [
      {
        count: 4,
        overlayUrl: "/amethyst-dream/4/overlay.png",
        backgroundUrl: "/amethyst-dream/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/amethyst-dream/8/overlay.png",
        backgroundUrl: "/amethyst-dream/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "green-pop",
    name: "Green Pop",
    layouts: [
      {
        count: 4,
        overlayUrl: "/green-pop/4/overlay.png",
        backgroundUrl: "/green-pop/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/green-pop/8/overlay.png",
        backgroundUrl: "/green-pop/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "opal-glow",
    name: "Opal Glow",
    layouts: [
      {
        count: 4,
        overlayUrl: "/opal-glow/4/overlay.png",
        backgroundUrl: "/opal-glow/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/opal-glow/8/overlay.png",
        backgroundUrl: "/opal-glow/8/bg.png",
      },
    ],
    isNew: true,
  },

  {
    id: "meow-cha",
    name: "Meow Cha",
    layouts: [
      {
        count: 4,
        overlayUrl: "/meow-cha/4/overlay.png",
        backgroundUrl: "/meow-cha/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/meow-cha/8/overlay.png",
        backgroundUrl: "/meow-cha/8/bg.png",
      },
    ],
    isNew: true,
  },
  {
    id: "retro-spark",
    name: "Retro Spark",
    layouts: [
      {
        count: 4,
        overlayUrl: "/retro-spark/4/overlay.png",
        backgroundUrl: "/retro-spark/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/retro-spark/8/overlay.png",
        backgroundUrl: "/retro-spark/8/bg.png",
      },
    ],
  },
  {
    id: "bunny",
    name: "Bunny",
    layouts: [
      {
        count: 4,
        overlayUrl: "/bunny/4/overlay.png",
        backgroundUrl: "/bunny/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/bunny/8/overlay.png",
        backgroundUrl: "/bunny/8/bg.png",
      },
    ],
  },
  {
    id: "mario",
    name: "Mario",
    layouts: [
      {
        count: 4,
        overlayUrl: "/mario/4/overlay.png",
        backgroundUrl: "/mario/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/mario/8/overlay.png",
        backgroundUrl: "/mario/8/bg.png",
      },
    ],
  },
  {
    id: "bloomy",
    name: "Bloomy",
    layouts: [
      {
        count: 4,
        overlayUrl: "/bloomy/4/overlay.png",
        backgroundUrl: "/bloomy/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/bloomy/8/overlay.png",
        backgroundUrl: "/bloomy/8/bg.png",
      },
    ],
  },
  {
    id: "wavy-star",
    name: "Wavy Star",
    layouts: [
      {
        count: 4,
        overlayUrl: "/wavy-star/4/overlay.png",
        backgroundUrl: "/wavy-star/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/wavy-star/8/overlay.png",
        backgroundUrl: "/wavy-star/8/bg.png",
      },
    ],
  },
  {
    id: "relax",
    name: "Relax",
    layouts: [
      {
        count: 4,
        overlayUrl: "/relax/4/overlay.png",
        backgroundUrl: "/relax/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/relax/8/overlay.png",
        backgroundUrl: "/relax/8/bg.png",
      },
    ],
  },
  {
    id: "letter",
    name: "Letter",
    layouts: [
      {
        count: 4,
        overlayUrl: "/letter/4/overlay.png",
        backgroundUrl: "/letter/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/letter/8/overlay.png",
        backgroundUrl: "/letter/8/bg.png",
      },
    ],
  },
  {
    id: "fancy",
    name: "Fancy",
    layouts: [
      {
        count: 4,
        overlayUrl: "/fancy/4/overlay.png",
        backgroundUrl: "/fancy/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/fancy/8/overlay.png",
        backgroundUrl: "/fancy/8/bg.png",
      },
    ],
  },
  {
    id: "connect",
    name: "Connect",
    layouts: [
      {
        count: 4,
        overlayUrl: "/connect/4/overlay.png",
        backgroundUrl: "/connect/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/connect/8/overlay.png",
        backgroundUrl: "/connect/8/bg.png",
      },
    ],
  },
  {
    id: "hello-thailand",
    name: "Hello Thailand",
    layouts: [
      {
        count: 4,
        overlayUrl: "/hello-thailand/4/overlay.png",
        backgroundUrl: "/hello-thailand/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/hello-thailand/8/overlay.png",
        backgroundUrl: "/hello-thailand/8/bg.png",
      },
    ],
  },
  {
    id: "permission-to-dance",
    name: "Permission To Dance",
    layouts: [
      {
        count: 4,
        overlayUrl: "/permission-to-dance/4/overlay.png",
        backgroundUrl: "/permission-to-dance/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/permission-to-dance/8/overlay.png",
        backgroundUrl: "/permission-to-dance/8/bg.png",
      },
    ],
  },
  {
    id: "hoa-binh",
    name: "Hoa Binh",
    layouts: [
      {
        count: 4,
        overlayUrl: "/hoa-binh/4/overlay.png",
        backgroundUrl: "/hoa-binh/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/hoa-binh/8/overlay.png",
        backgroundUrl: "/hoa-binh/8/bg.png",
      },
    ],
  },
  {
    id: "vietnam",
    name: "Vietnam",
    layouts: [
      {
        count: 4,
        overlayUrl: "/vietnam/4/overlay.png",
        backgroundUrl: "/vietnam/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/vietnam/8/overlay.png",
        backgroundUrl: "/vietnam/8/bg.png",
      },
    ],
  },
  {
    id: "bomber",
    name: "Bomber",
    layouts: [
      {
        count: 4,
        overlayUrl: "/bomber/4/overlay.png",
        backgroundUrl: "/bomber/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/bomber/8/overlay.png",
        backgroundUrl: "/bomber/8/bg.png",
      },
    ],
  },
  {
    id: "life-goes-on",
    name: "Life goes on",
    layouts: [
      {
        count: 4,
        overlayUrl: "/life-goes-on/4/overlay.png",
        backgroundUrl: "/life-goes-on/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/life-goes-on/8/overlay.png",
        backgroundUrl: "/life-goes-on/8/bg.png",
      },
    ],
  },
  {
    id: "y2k",
    name: "Y2K",
    layouts: [
      {
        count: 4,
        overlayUrl: "/y2k/4/overlay.png",
        backgroundUrl: "/y2k/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/y2k/8/overlay.png",
        backgroundUrl: "/y2k/8/bg.png",
      },
    ],
  },
  {
    id: "besties",
    name: "Besties",
    layouts: [
      {
        count: 4,
        overlayUrl: "/besties/4/overlay.png",
        backgroundUrl: "/besties/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/besties/8/overlay.png",
        backgroundUrl: "/besties/8/bg.png",
      },
    ],
  },
  {
    id: "starlight",
    name: "Starlight",
    layouts: [
      {
        count: 4,
        overlayUrl: "/starlight/4/overlay.png",
        backgroundUrl: null,
      },
      {
        count: 8,
        overlayUrl: "/starlight/8/overlay.png",
        backgroundUrl: null,
      },
    ],
  },
  {
    id: "power-girls",
    name: "Power Girls",
    layouts: [
      {
        count: 4,
        overlayUrl: "/power-girls/4/overlay.png",
        backgroundUrl: "/power-girls/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/power-girls/8/overlay.png",
        backgroundUrl: "/power-girls/8/bg.png",
      },
    ],
  },
  {
    id: "happy-birthday",
    name: "Happy Birthday",
    layouts: [
      {
        count: 4,
        overlayUrl: "/happy-birthday/4/overlay.png",
        backgroundUrl: "/happy-birthday/4/bg.png",
      },
      {
        count: 8,
        overlayUrl: "/happy-birthday/8/overlay.png",
        backgroundUrl: "/happy-birthday/8/bg.png",
      },
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
