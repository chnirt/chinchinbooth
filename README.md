# ChinChin Booth

Photo booth web: chụp hoặc tải ảnh, gắn filter, chọn strip 1×4 / 2×4, tùy chỉnh frame, rồi tải xuống hoặc gửi QR lên điện thoại.

Live: [https://chinchinbooth.trinhchinchin.workers.dev](https://chinchinbooth.trinhchinchin.workers.dev)

[Hướng dẫn vận hành và kiểm tra](docs/van-hanh-va-kiem-tra.md) có checklist cho camera, JPEG, QR và cách xử lý lỗi thường gặp.

---

## Tech stack

| Lớp | Công nghệ |
| --- | --- |
| Framework | Next.js 15.5 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (New York), Framer Motion |
| i18n | next-intl 4, cookie `NEXT_LOCALE` |
| Ảnh / QR | html2canvas-pro, Cloudflare R2, qrcode.react |
| Camera | `getUserMedia` + canvas 2D, `context-filter-polyfill` |
| Analytics | Google Analytics 4 |
| PWA | `src/app/manifest.json` (standalone), không có service worker / offline |
| Tooling | pnpm, Husky (`pnpm build` trước mỗi commit), Prettier, Docker |

State của phiên và ảnh chụp nằm trong bộ nhớ trình duyệt. **Send to phone** gửi JPEG đã ghép đến Worker để lưu tạm trong bucket R2 riêng tư.

---

## Luồng người dùng

Ứng dụng là **một route `/`**, hai bước client: `shoot` → `layout`.

```
Mở app
  → Xin quyền camera, liệt kê thiết bị
  → Chụp hoặc upload — bắt buộc đủ 8 ảnh mới sang layout (kể cả khi sẽ chọn strip 4)
  → Filter CSS live trên preview, bake vào canvas khi chụp (ảnh upload không qua filter)
  → Đủ 8 ảnh: nút chính chuyển sang layout
  → Chọn strip 4 (1×4) hoặc 8 (2×4)
  → Chọn đúng số ảnh, thứ tự = vị trí trên strip
  → Frame: preset / màu đặc / gradient
  → Download JPEG hoặc gửi JPEG tạm lên R2 → QR + share
  → Retake: xóa ảnh, về bước shoot
```

**Desktop**

- Shoot: camera + filter + phím tắt
- Layout: gallery trái, preview phải, nút Retake / Download / Send to phone

**Mobile** (`useMobile`, breakpoint 768)

- Filter gallery ẩn mặc định
- Layout: preview + `Header` (retake / download / share) + `BottomNavigation`
- Chọn ảnh / frame / layout qua `MyDrawer`
- Download: dialog “press and hold” (iOS), không trigger `<a download>`
- PWA standalone (`usePWA`): mở tab mới với blob HTML chứa ảnh, tránh chặn download

---

## Cấu trúc source

```
chinchinbooth/
├── src/
│   ├── app/                    # App Router
│   │   ├── page.tsx            # Orchestrator 2 bước (client)
│   │   ├── layout.tsx          # Font, metadata, NextIntl, Toaster
│   │   ├── _page.tsx           # Template create-next-app — không dùng
│   │   ├── globals.css
│   │   ├── manifest.json       # PWA
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── photo-shoot.tsx     # Camera, timer, filter, upload, undo
│   │   ├── layout-selection.tsx
│   │   ├── frame-selector.tsx
│   │   ├── filter-gallery.tsx
│   │   ├── upload-photo-button.tsx
│   │   ├── download-dialog.tsx # Lưu ảnh trên mobile / iOS
│   │   ├── share-dialog.tsx    # QR của ảnh tạm R2
│   │   ├── policy-dialog.tsx
│   │   ├── navbar.tsx / footer.tsx / header.tsx
│   │   ├── bottom-navigation.tsx / my-drawer.tsx
│   │   ├── language-switcher.tsx / locale-switcher-select.tsx
│   │   ├── step-progress.tsx   # Có file, đang comment khỏi page
│   │   ├── magicui/            # Confetti, sparkles
│   │   └── ui/                 # shadcn
│   ├── constants/
│   │   ├── index.ts            # MAX_CAPTURE=8, TIMER_OPTIONS
│   │   ├── assets.ts           # Catalog frame (~40 preset)
│   │   ├── filters.ts          # Bộ filter CSS
│   │   ├── styles.ts           # COLOR_PALETTE, GRADIENT_PRESETS
│   │   └── languages.ts        # 6 locale UI
│   ├── hooks/use-mobile.ts, use-pwa.ts
│   ├── i18n/config.ts, request.ts
│   ├── lib/upload-utils.ts, frame-utils.ts, utils.ts
│   ├── services/locale.ts      # Cookie locale (server action)
│   └── types/
├── messages/                   # en, vi, th, km, id, tl
├── public/                     # Frame local + icon PWA + OG
├── scripts/update-version.sh
├── Dockerfile
└── next.config.ts
```

`PhotoShoot` và `LayoutSelection` load bằng `next/dynamic` để tách bundle camera / canvas.

---

## Module chính

### 1. Orchestrator — `src/app/page.tsx`

Giữ toàn bộ session:

| State | Vai trò |
| --- | --- |
| `step` | `"shoot"` \| `"layout"` |
| `capturedImages` | Data URL PNG |
| `layoutType` | `4` hoặc `8` |
| `selectedIndices` | Thứ tự ảnh trên strip |
| `selectedFrame` | ID trong `FRAMES` (`"none"` mặc định) |
| `imageUrl` | Link R2 qua Worker, lưu cùng hạn 24 giờ ở bước layout |
| `previewRef` | DOM strip để html2canvas chụp |

`generateImage(layoutType)`:

1. Scale preview về **600×1800** (1×4) hoặc **1200×1800** (2×4)
2. html2canvas-pro (`allowTaint`, `useCORS`)
3. Vẽ lại canvas cố định, xuất JPEG quality 1.0
4. Confetti khi xong

`uploadAndGenerateQR()` dùng chung canvas với luồng tải JPEG, nén ảnh gửi QR, rồi gọi `POST /api/qr`.

### 2. Camera — `src/components/photo-shoot.tsx` và `src/hooks/use-booth-camera.ts`

- Xin quyền, `enumerateDevices`, phân loại camera theo label + heuristic mobile
- Mobile ưu tiên camera trước; desktop lấy device đầu
- Constraint: `1280×960` ideal, `deviceId.exact`
- Mirror mặc định với camera trước; phím `M` / nút flip
- Tắt stream khi tab ẩn (`visibilitychange`) hoặc unload
- Countdown: `TIMER_OPTIONS = [1, 3, 5, 10]`; default 1s (dev) / 3s (prod)
- Auto mode bật sẵn: chụp xong chờ 1s rồi countdown tiếp đến đủ 8
- Capture: canvas + `generateFilterStyle` + mirror transform → PNG data URL
- Flash đen ~80ms khi chụp
- Upload file: đọc lần lượt bằng `FileReader` theo thứ tự file được chọn, tối đa số slot còn lại. Nếu một file đọc lỗi, bỏ qua cả lượt. Nút upload yêu cầu camera đã khởi động và phiên chụp đang rảnh.
- Phím tắt (không dùng khi focus input): Space/Enter chụp hoặc next, Delete undo, T timer, M mirror, F filter

### 3. Filter — `src/constants/filters.ts` + `filter-gallery.tsx`

CSS filter: `brightness`, `contrast`, `grayscale`, `sepia`, `saturate`, `hue-rotate`.

Nhóm: `normal`, `classic`, `vivid`, `warm`, `retro`, `cinematic`, `moody`, `urban`, `documentary`, `fashion`.

Preview gallery dùng ảnh mẫu Cloudinary. Filter áp live trên `<video>`, bake vào canvas lúc chụp.

### 4. Layout & frame — `layout-selection.tsx` + `constants/assets.ts`

- **1×4**: cột dọc `aspect-[1/3]`, padding 10%, gap 5%
- **2×4**: hai cột `aspect-[2/3]`, padding 5%
- Mỗi frame có `layouts[]` với `count` 4/8, `overlayUrl`, `backgroundUrl`
- Overlay `z-20`, ảnh `z-10`, background `z-0`
- Một số frame mới (Pinku Yume, Arirang, Halloween, …) trỏ Cloudinary; phần còn lại (`wavy-star`, `vietnam`, `hearts`, …) dùng path `/public`
- Frame đã comment: Happy New Year, Christmas Tree, Christmas Snow (asset vẫn trong `public/`)
- Link QR gắn với layout, thứ tự ảnh, màu, gradient và frame của strip đã gửi.

### 5. Download / share

| Môi trường | Download | Share |
| --- | --- | --- |
| Desktop | `<a download>` `chinchinbooth_1x4_{ts}.jpeg` hoặc `_2x4_` | Upload + dialog QR |
| Mobile browser | `DownloadDialog` + long-press | Giống desktop |
| PWA | Tab mới với `<img>` dùng JPEG Blob | Giống desktop |

Download và QR dùng chung bản render strip 600 × 1800 hoặc 1200 × 1800. Download dùng JPEG Blob, QR mã hóa riêng với chất lượng 0.8 và dùng lại link cho strip đã gửi nếu strip chưa đổi.

Share: `navigator.share` nếu có, không thì copy URL. QR từ `QRCodeCanvas`.

### 6. Gửi ảnh qua QR

Worker nhận JPEG qua `POST /api/qr` rồi trả link cùng origin. `GET /s/...` chỉ trả ảnh nếu mã ngẫu nhiên và thời hạn khớp với metadata R2. Link ngừng mở đúng sau 24 giờ. Giữ bucket `chinchinbooth-qr` ở Standard, tắt r2.dev và không gắn public domain. Lifecycle rule `expire-qr` dọn ảnh sau khi đủ một ngày, có thể xóa vật lý muộn hơn lúc link hết hạn.

- Worker giới hạn JPEG **1 MiB** và dùng Durable Object SQLite để giữ chung bộ đếm **1.000 lượt gửi** và **20.000 lượt đọc ảnh qua QR** mỗi ngày UTC. Vượt giới hạn trả `429`. Rate limit theo IP chặn thêm ở từng điểm hiện diện Cloudflare.
- Bucket dùng tối đa **3.000 vị trí** luân phiên. Chỉ ghi đè vị trí sau khi link cũ đã hết hạn. Nếu lifecycle dọn chậm, dung lượng của luồng này vẫn giới hạn khoảng **3,15 GB**. Dùng riêng bucket cho QR và giữ lớp Standard.
- Mỗi lượt được cấp quota dùng tối đa một lần ghi hoặc đọc R2. Trong tháng 31 ngày, luồng này dùng tối đa **31.000 ghi / 620.000 đọc**. Quota R2 miễn phí dùng chung cả tài khoản. Để tránh chi phí bổ sung của Worker và Durable Object, giữ **Workers Free** và kiểm tra mức dùng chung trước khi mở production.


---

## i18n

Cookie `NEXT_LOCALE` qua server action `src/services/locale.ts`. `src/i18n/request.ts` load `messages/{locale}.json`. Không dùng `[locale]` segment — đổi ngôn ngữ không đổi URL.

| File | Locale trong `i18n/config.ts` | Hiện trên switcher |
| --- | --- | --- |
| `en.json` `vi.json` `th.json` `km.json` | Có | Có |
| `id.json` `tl.json` | **Không** (type `Locale`) | Có (`languages.ts`) |

Chọn Indonesia / Tagalog vẫn set cookie và file message tồn tại, nhưng type `Locale` chưa khai báo — dễ lệch khi thêm locale mới.

Chuỗi UI nằm dưới namespace `HomePage`. Một số key sticker (`stickers`, `sticker_tips`) không có UI tương ứng.

---

## SEO / PWA / metadata

`layout.tsx`: title, description, Open Graph, Twitter, Google site verification, apple-mobile-web-app-title. OG image: `/og-image.jpg`.

`src/lib/site-url.ts` dùng chung URL chính cho canonical, Open Graph, dữ liệu `WebSite` và sitemap. `robots.ts` cho phép crawl và trỏ đến sitemap trên Workers.

`sitemap.ts` liệt kê trang chủ. Vercel chuyển hướng vĩnh viễn về Workers.

PWA: name ChinChin Booth, standalone, icon 192 / 512 maskable.

---

## Biến môi trường

Không commit `.env*` (gitignore). Cần file `.env.local`:

```bash
NEXT_PUBLIC_APP_VERSION=1.0.0   # fallback footer nếu thiếu
ANALYZE=true                     # optional, bật @next/bundle-analyzer
```

`next.config.ts` cho phép `res.cloudinary.com` cho ảnh khung và filter có sẵn.

`scripts/update-version.sh`: bump theo git tag + commit message `#major` / `#minor`, ghi `.env.local`, cập nhật Vercel env, push tag.

---

## Chạy local

Yêu cầu: Node 18+, pnpm.

```bash
pnpm install
pnpm dev          # next dev --turbopack → http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm bundle-analyzer
```

Docker (multi-stage Node 18 Alpine, copy cả repo vào runner — image nặng):

```bash
pnpm docker:build
pnpm docker:run      # :3000
pnpm docker:logs
pnpm docker:stop
```

---

## Deploy Cloudflare Workers

Dùng [@opennextjs/cloudflare](https://opennext.js.org/cloudflare/get-started) (dùng Next.js 16). `NEXT_PUBLIC_*` phải có lúc **build** (file `.env.local`).

Lần đầu:

```bash
pnpm install
pnpm cf:login
pnpm exec wrangler r2 bucket create chinchinbooth-qr
pnpm exec wrangler r2 bucket lifecycle add chinchinbooth-qr expire-qr qr/ --expire-days 1
pnpm exec wrangler r2 bucket lifecycle list chinchinbooth-qr
pnpm cf:deploy
```

Hoặc một lệnh: `sh scripts/cf-deploy.sh` (tự login nếu chưa).

Để test QR cục bộ, dùng runtime Workers với R2, rate limits và Durable Object mô phỏng. Next dev và Docker thuần Next phục vụ tải JPEG tại máy.

```bash
pnpm cf:preview
```

URL mặc định: `https://chinchinbooth.<subdomain>.workers.dev`. Gắn domain: Cloudflare Dashboard → Workers → chinchinbooth → Custom Domains.

Trong Workers Builds, cấu hình các lệnh sau khi kết nối repo.

| Setting | Value |
| --- | --- |
| Build command | `pnpm cf:build` |
| Deploy command | `pnpm exec opennextjs-cloudflare deploy` |
| Env | `NEXT_PUBLIC_APP_VERSION` (tùy chọn) |

Google Analytics 4 được gắn trong root layout ở bản production.

---

## Phím tắt (desktop, bước shoot)

| Phím | Hành động |
| --- | --- |
| Space / Enter | Chụp, hủy countdown, hoặc sang layout khi đủ 8 ảnh |
| Backspace / Delete | Undo ảnh cuối |
| T | Đổi timer |
| M | Mirror |
| F | Hiện / ẩn filter gallery |

---

## Ghi chú audit source

Đã rà toàn bộ `src/`, `messages/`, config, Docker, script. Các lệch nên biết khi maintain:

1. **Privacy copy vs thực tế** — `policy-dialog` nói không thu thập, không cookie, không cloud, xử lý local. Thực tế: cookie locale, gửi JPEG qua R2 khi chia sẻ, Google Analytics 4.
2. **Sitemap 404** — `/photo-booth`, `/stickers` không tồn tại.
3. **Locale không đồng bộ** — UI 6 ngôn ngữ, `i18n/config.ts` chỉ 4.
5. **Dead code** — `src/app/_page.tsx`, `step-progress.tsx` (comment), `types/sticker-types.ts`, i18n sticker, `public/stickers/kimchi-hamster/`, `magicui/confetti.tsx` (page dùng `canvas-confetti` trực tiếp), package `next-cloudinary`.
6. **Asset lai** — frame mới trên Cloudinary, frame cũ trong `/public`. Frame holiday đã comment vẫn nằm trong public. `public/hoa-binh/8/_overlay.png` là file thừa.
7. **Husky pre-commit chạy `pnpm build`** — chậm, fail build thì không commit được.
8. **Dockerfile** — copy nguyên source + `node_modules` vào runner, không `standalone`. `NEXT_PUBLIC_*` phải có lúc build mới vào client bundle; Dockerfile không inject env.
9. **html2canvas** — phụ thuộc CORS (`crossOrigin="anonymous"` đã gắn gần đây). Frame `/public` an toàn; Cloudinary cần CORS đúng. `allowTaint: true` vẫn có thể fail im lặng nếu asset thiếu header CORS.
10. **Không persist session** — reload mất ảnh. Đúng với “in-memory booth”, nhưng Retake / refresh không khôi phục được.
11. **`next.config.ts` dùng `module.exports`** trong file `.ts` — chạy được nhờ bundler, không nhất quán với `export default`.
12. **Bắt buộc 8 ảnh** — không thể sang layout với 4 tấm dù chọn strip 1×4. Ảnh upload bỏ qua filter (chỉ camera bake filter lúc chụp).
13. **`DEFAULT_FILTERS` lệch type** — có `blur` (không dùng), thiếu `hueRotate` so với `FilterValues`.
14. **i18n cứng** — tiếng Anh hardcode ở camera label, ô Empty, bottom nav, frame-selector, filter category, PWA `alert("Popup blocked")`.
15. **Auto mode không tắt được** — `isAutoModeEnabled` mặc định `true`, UI/phím tắt toggle đã comment.
16. **Bug nhỏ** — `UploadPhotoButton` đọc file song song, thứ tự không ổn định; class `filter-transition` được gắn lên video nhưng không có trong CSS.

---

## Thêm frame mới

1. Thêm folder `public/{id}/4/` và `8/` (`overlay.png`, `bg.png`) **hoặc** upload Cloudinary.
2. Push object vào `FRAMES` trong `src/constants/assets.ts`:

```ts
{
  id: "my-frame",
  name: "My Frame",
  layouts: [
    { count: 4, overlayUrl: "/my-frame/4/overlay.png", backgroundUrl: "/my-frame/4/bg.png" },
    { count: 8, overlayUrl: "/my-frame/8/overlay.png", backgroundUrl: "/my-frame/8/bg.png" },
  ],
  isNew: true,
}
```

`overlayUrl` / `backgroundUrl` có thể `null`. `preloadFrameLayout` tải trước nền và overlay của layout hiện tại. `StripPreview` là DOM dùng chung cho xem trước và xuất ảnh.

---

## License / liên hệ

© @chinchinbooth. Version hiển thị ở footer từ `NEXT_PUBLIC_APP_VERSION`.
