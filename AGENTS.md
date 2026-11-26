# ChinChin Booth

## Nơi đặt thay đổi

| Tính năng | Mã nguồn sở hữu |
| --- | --- |
| Phiên chụp, điều hướng giữa hai bước, xuất JPEG, điều phối gửi QR | `src/app/page.tsx` |
| Quyền camera, chọn thiết bị, vòng đời stream | `src/hooks/use-booth-camera.ts` |
| Countdown, chụp, undo, phím tắt và upload ảnh có sẵn | `src/components/photo-shoot.tsx`, `src/components/upload-photo-button.tsx` |
| Chọn ảnh, loại strip, kiểu nền, hành động desktop/mobile | `src/components/layout-selection.tsx` |
| DOM strip dùng chung cho preview và xuất ảnh | `src/components/strip-preview.tsx` |
| Tùy biến, catalog, thumbnail và nạp asset của frame | `src/components/frame-customization.tsx`, `src/constants/assets.ts`, `src/components/frame-selector.tsx`, `src/lib/frame-utils.ts` |
| Biên Cloudinary và giao diện QR | `src/lib/upload-utils.ts`, `src/components/share-dialog.tsx` |
| Ngôn ngữ và cookie | `messages/`, `src/i18n/`, `src/services/locale.ts` |

## Nguyên tắc sửa

- Giữ state phiên ở component cha khi cả hai bước dùng chung. Giữ state giao diện gần component sử dụng. Tính giá trị suy ra từ state hiện có.
- Dùng các lớp `booth-glass`, `booth-control` và `booth-modal` trong `src/app/globals.css` cho bề mặt và điều khiển. Đặt blur và hiệu ứng nền bên ngoài DOM xuất JPEG.
- Giữ logo chữ `@chinchinbooth`, navbar toàn chiều rộng và bố cục dọc của màn hình chụp. Giữ kiểu nút chụp gốc cho cụm điều khiển bên dưới camera.
- Preview và ảnh xuất dùng cùng DOM `StripPreview`. Khi sửa padding, tỷ lệ hay thứ tự lớp, kiểm tra cả JPEG 1×4 và 2×4.
- Hook camera sở hữu stream và listener. Dừng mọi track khi đổi thiết bị, rời bước chụp hoặc ẩn tab. Dừng cả stream trả về trễ sau khi request đã lỗi thời.
- Khi thêm effect, dọn timer, listener hoặc async callback trong cleanup. Tránh effect quan sát DOM khi kết quả của phép đo chưa được dùng.
- Giữ gallery thumbnail tải lười và asset của strip đang hiển thị tải ngay. Dùng CORS nhất quán giữa preload và DOM ảnh. Chỉ preload layout đang chọn.
- Giữ các import động ở ranh giới bước và giữ html2canvas ở đường chạy xuất ảnh. Nếu sửa hiệu năng, ghi rõ chỉ số đã đo hoặc công việc đã loại bỏ.
- Dùng component UI và chuỗi dịch hiện có. Khi thêm chuỗi, kiểm tra các file trong `messages/`. Giữ desktop và mobile dùng chung dữ liệu và hành động.

## Hợp đồng cần giữ

- Bước chụp cần đủ 8 ảnh. Nút tải ảnh có sẵn phụ thuộc vào camera đang hoạt động và phiên đang rảnh. Giữ timer, auto capture, undo, filter, mirror và phím tắt.
- Layout chọn chính xác 4 hoặc 8 ảnh. Thứ tự chọn là thứ tự đặt ảnh theo cột. JPEG tải trực tiếp giữ kích thước 600 × 1800 hoặc 1200 × 1800. Giữ hộp thoại lưu trên mobile và nhánh mở ảnh của PWA.
- Ảnh phiên nằm trong bộ nhớ. Chỉ thao tác **Send to phone** gửi JPEG lên Cloudinary. Giữ QR, copy link và chia sẻ qua hệ thống.
- Giữ cookie locale và luồng reset qua **Retake**.

## Kiểm tra trước khi bàn giao

Chạy `pnpm exec tsc --noEmit --incremental false` và `pnpm build`. Chạy checklist trong [hướng dẫn vận hành](docs/van-hanh-va-kiem-tra.md) cho những luồng bị ảnh hưởng. Ghi rõ cấu hình mô phỏng và phần còn cần kiểm tra trên thiết bị thật. Dùng Cloudinary thử nghiệm hoặc giả lập request khi dùng ảnh kiểm thử.
