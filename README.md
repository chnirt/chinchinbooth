# ChinChin Booth

Photo booth web: chụp hoặc tải ảnh, gắn filter, chọn strip 1×4 / 2×4, tùy chỉnh frame, rồi tải xuống hoặc gửi QR lên điện thoại.

Live: [https://chinchinbooth.vercel.app](https://chinchinbooth.vercel.app)

---

## Tech stack

| Lớp | Công nghệ |
| --- | --- |
| Framework | Next.js 15.5 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (New York), Framer Motion |
| i18n | next-intl 4, cookie `NEXT_LOCALE` |
| Ảnh / QR | html2canvas-pro, Cloudinary unsigned upload, qrcode.react |
| Camera | `getUserMedia` + canvas 2D, `context-filter-polyfill` |
| Analytics | Vercel Analytics, Speed Insights |
| PWA | `src/app/manifest.json` (standalone), không có service worker / offline |
| Tooling | pnpm, Husky (`pnpm build` trước mỗi commit), Prettier, Docker |

Không có backend riêng, database, hay auth. State nằm trên client. Ảnh session là data URL trong memory. Chỉ khi bấm **Send to phone** mới upload Cloudinary.

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
  → Download JPEG hoặc upload Cloudinary → QR + share
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
│   │   ├── share-dialog.tsx    # QR Cloudinary
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
| `imageUrl` | URL Cloudinary sau upload |
| `previewRef` | DOM strip để html2canvas chụp |

`generateImage(layoutType)`:

1. Scale preview về **600×1800** (1×4) hoặc **1200×1800** (2×4)
2. html2canvas-pro (`allowTaint`, `useCORS`)
3. Vẽ lại canvas cố định, xuất JPEG quality 1.0
4. Confetti khi xong

`uploadAndGenerateQR()`: html2canvas scale 2 → JPEG 0.8 → `uploadToCloudinary` → set `imageUrl` → `updateQRGenerationCount()`.

### 2. Camera — `src/components/photo-shoot.tsx`

- Xin quyền, `enumerateDevices`, phân loại camera theo label + heuristic mobile
- Mobile ưu tiên camera trước; desktop lấy device đầu
- Constraint: `1280×960` ideal, `deviceId.exact`
- Mirror mặc định với camera trước; phím `M` / nút flip
- Tắt stream khi tab ẩn (`visibilitychange`) hoặc unload
- Countdown: `TIMER_OPTIONS = [1, 3, 5, 10]`; default 1s (dev) / 3s (prod)
- Auto mode bật sẵn: chụp xong chờ 1s rồi countdown tiếp đến đủ 8
- Capture: canvas + `generateFilterStyle` + mirror transform → PNG data URL
- Flash đen ~80ms khi chụp
- Upload file: `FileReader` data URL, tối đa số slot còn lại
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
- Đổi màu / gradient / frame sẽ `setImageUrl(null)` — QR cũ không còn khớp preview

### 5. Download / share

| Môi trường | Download | Share |
| --- | --- | --- |
| Desktop | `<a download>` `chinchinbooth_1x4_{ts}.jpeg` hoặc `_2x4_` | Upload + dialog QR |
| Mobile browser | `DownloadDialog` + long-press | Giống desktop |
| PWA | Tab mới, blob HTML + `<img>` | Giống desktop |

Share: `navigator.share` nếu có, không thì copy URL. QR từ `QRCodeCanvas`.

### 6. Cloudinary — `src/lib/upload-utils.ts`

Unsigned upload:

```
POST https://api.cloudinary.com/v1_1/{CLOUD_NAME}/auto/upload
file + upload_preset
```

`checkDailyQRLimit(limit=5)` đọc `localStorage.qrGenCount` **nhưng không được gọi** — giới hạn ngày chỉ đếm, không chặn. `updateQRGenerationCount()` vẫn tăng counter.

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

`robots.ts`: allow all, sitemap `https://chinchinbooth.vercel.app/sitemap.xml`.

`sitemap.ts` khai báo `/`, `/photo-booth`, `/stickers` — **hai URL sau không có page**.

PWA: name ChinChin Booth, standalone, icon 192 / 512 maskable.

---

## Biến môi trường

Không commit `.env*` (gitignore). Cần file `.env.local`:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_APP_VERSION=1.0.0   # fallback footer nếu thiếu
ANALYZE=true                     # optional, bật @next/bundle-analyzer
```

Preset Cloudinary phải **unsigned**. `next.config.ts` cho phép `res.cloudinary.com` với cache 30 ngày.

`scripts/update-version.sh`: bump theo git tag + commit message `#major` / `#minor`, ghi `.env.local`, cập nhật Vercel env, push tag.

---

## Chạy local

Yêu cầu: Node 18+, pnpm.

```bash
pnpm install
# tạo .env.local với Cloudinary
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

Dùng [@opennextjs/cloudflare](https://opennext.js.org/cloudflare/get-started) (cần Next ≥ 15.5). `NEXT_PUBLIC_*` phải có lúc **build** (file `.env.local`).

Lần đầu:

```bash
pnpm install
pnpm cf:login
# đảm bảo .env.local có Cloudinary
pnpm cf:deploy
```

Hoặc một lệnh: `sh scripts/cf-deploy.sh` (tự login nếu chưa).

Sau đó preview runtime Workers local:

```bash
pnpm cf:preview
```

URL mặc định: `https://chinchinbooth.<subdomain>.workers.dev`. Gắn domain: Cloudflare Dashboard → Workers → chinchinbooth → Custom Domains.

CI (Workers Builds): build command `pnpm cf:deploy` **không** dùng — dùng `npx opennextjs-cloudflare build` rồi deploy step, hoặc connect repo và set:

| Setting | Value |
| --- | --- |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Env | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `NEXT_PUBLIC_APP_VERSION` |

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

1. **Privacy copy vs thực tế** — `policy-dialog` nói không thu thập, không cookie, không cloud, xử lý local. Thực tế: cookie locale, Cloudinary khi share, Vercel Analytics/Speed Insights, `localStorage` đếm QR.
2. **Sitemap 404** — `/photo-booth`, `/stickers` không tồn tại.
3. **Locale không đồng bộ** — UI 6 ngôn ngữ, `i18n/config.ts` chỉ 4.
4. **QR limit chết** — `checkDailyQRLimit` không được gọi.
5. **Dead code** — `src/app/_page.tsx`, `step-progress.tsx` (comment), `types/sticker-types.ts`, i18n sticker, `public/stickers/kimchi-hamster/`, `magicui/confetti.tsx` (page dùng `canvas-confetti` trực tiếp), package `next-cloudinary` (upload bằng `fetch` thô).
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
16. **Bug nhỏ** — `UploadPhotoButton` đọc file song song, thứ tự không ổn định; `DownloadDialog` cleanup timer nằm trong `requestAnimationFrame` nên có thể leak; `ResizeObserver` trong layout là no-op; class `filter-transition` được gắn lên video nhưng không có trong CSS.

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

`overlayUrl` / `backgroundUrl` có thể `null`. `handleFrameSelection` preload cả hai trước khi chọn.

---

## License / liên hệ

© @chinchinbooth. Version hiển thị ở footer từ `NEXT_PUBLIC_APP_VERSION`.
