# Vận hành và kiểm tra ChinChin Booth

Hướng dẫn này dành cho người bảo trì photo booth khi thay đổi camera, giao diện chọn ảnh, frame hoặc chức năng gửi qua QR. Kiến trúc và cách triển khai nằm trong [README](../README.md).

## Chuẩn bị môi trường

Chạy `pnpm install` rồi `pnpm dev`. Mở `http://localhost:3000` và cấp quyền camera. Khi kiểm tra từ điện thoại hoặc thiết bị khác qua mạng nội bộ, dùng một URL HTTPS để trình duyệt cho phép truy cập camera.

Để kiểm tra QR, chạy `pnpm cf:preview` để dùng bucket R2 và Durable Object mô phỏng. Chỉ **Send to phone** gửi JPEG từ phiên. Dùng ảnh mẫu khi thử trên production.

## Checklist kiểm tra thủ công

| Hạng mục | Thao tác | Kết quả cần đối chiếu |
| --- | --- | --- |
| Camera | Cấp quyền, thử đổi camera nếu có nhiều thiết bị, bật mirror và chọn một filter dễ nhận biết | Preview dùng camera được chọn. Ảnh chụp giữ hiệu ứng mirror và filter khi chúng đang bật. |
| Đếm ngược | Bắt đầu chụp tự động, hủy trong lúc đếm ngược, sau đó thử chụp tiếp | Lượt đã hủy dừng. Lượt tiếp theo chạy đến khi đủ slot nếu để chuỗi tự động hoàn tất. |
| Tải ảnh có sẵn | Khi camera đang hoạt động và không chụp, thử chọn nhiều file hơn số slot còn lại | Nếu chọn quá số slot, ứng dụng báo giới hạn và bỏ qua cả lượt chọn. Khi chọn trong giới hạn, ảnh tải vào giữ màu gốc. |
| Chọn strip | Thử tiếp tục với 7 ảnh, rồi thêm ảnh thứ 8. Chọn 4 ảnh theo thứ tự dễ nhận biết, sau đó đổi sang layout 8 ảnh | Bước layout mở khi đủ 8 ảnh. Thứ tự chọn quyết định vị trí trên strip. Đổi layout xóa lựa chọn ảnh. |
| Frame | Thử màu đặc, gradient, frame trong `public/` và frame từ Cloudinary | Mỗi lựa chọn thay thế kiểu trước đó. JPEG thể hiện đúng lớp nền, ảnh và overlay của preview. |
| Tải JPEG | Tải cả hai layout trên desktop. Lặp lại trong trình duyệt mobile và chế độ PWA standalone | Desktop tải JPEG 600 × 1800 hoặc 1200 × 1800 px. Mobile browser mở hộp thoại lưu ảnh. Standalone mở ảnh trong tab mới nếu trình duyệt cho phép. |
| Gửi qua QR | Chọn đủ ảnh, bấm **Send to phone**, rồi quét QR bằng thiết bị khác | QR mở đúng JPEG vừa tạo. Mở lại QR khi strip giữ nguyên để xác nhận dùng lại link. Đổi frame, thứ tự ảnh hoặc layout rồi xác nhận link mới. Kiểm tra link quá hạn trả 410 và link giả trả 404. |
| Locale và reset | Đổi ngôn ngữ rồi tải lại. Sau khi tạo strip, bấm **Retake** | Ngôn ngữ theo cookie `NEXT_LOCALE`. Retake quay về bước chụp với danh sách ảnh trống. |

## Xử lý lỗi theo triệu chứng

| Triệu chứng | Nơi bắt đầu kiểm tra |
| --- | --- |
| Camera không mở hoặc nút tải ảnh bị khóa | Kiểm tra HTTPS hoặc localhost, quyền camera và trạng thái thiết bị. `uploadDisabled` yêu cầu camera đã khởi động, còn slot trống và không có lượt chụp đang chạy. [Luồng camera](../src/components/photo-shoot.tsx) |
| Đủ ảnh đã chụp nhưng nút tải JPEG hoặc gửi QR bị khóa | Kiểm tra số ảnh **đã chọn** trong layout. Điều kiện là đúng 4 hoặc 8 ảnh tùy strip. [State của phiên](../src/app/page.tsx) |
| Frame xuất hiện trong preview nhưng thiếu trong JPEG | Thử cùng bộ ảnh với frame local. Nếu chỉ frame remote gặp lỗi, kiểm tra request của background và overlay, URL asset và header CORS trong DevTools. [Catalog frame](../src/constants/assets.ts) · [Luồng xuất ảnh](../src/app/page.tsx) |
| Bấm gửi qua QR và thấy thông báo lỗi | Xem request `POST /api/qr`. Mã 429 cho biết đã chạm giới hạn gửi hoặc mở ảnh. Mã 503 cần kiểm tra binding của R2, Durable Object và log Worker. Với 413, xác nhận JPEG gửi không vượt 1 MiB. [Luồng upload](../src/lib/upload-utils.ts) |
| Download hoạt động nhưng PWA không mở ảnh | Kiểm tra popup blocker. Nhánh standalone gọi `window.open` trước khi tạo JPEG. [Download theo thiết bị](../src/components/layout-selection.tsx) |
| Đổi ngôn ngữ nhưng tải trang lỗi | Kiểm tra giá trị cookie và file tương ứng trong `messages/`. Khi thêm ngôn ngữ, cập nhật cả danh sách locale, danh sách trên bộ chọn và file dịch. [Cấu hình locale](../src/i18n/config.ts) · [Nạp bản dịch](../src/i18n/request.ts) |

## Kiểm tra sau khi build

Chạy `pnpm build` và `pnpm start` để lặp lại luồng chụp, xuất JPEG và gửi QR trên bản production local. Nếu thay đổi cấu hình Cloudflare, chạy thêm `pnpm cf:preview` để kiểm tra bản OpenNext trong runtime Workers. Cả hai lệnh build và preview đều có thể chạy trước khi triển khai.
