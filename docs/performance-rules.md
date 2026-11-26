# Performance Rules (Angular 22, zoneless)

Nguyên tắc: **đo trước, sửa sau**. Không thêm cache / memo / virtual scroll / thư viện khi chưa thấy vấn đề thật. Quy ước code chung: `code-standards.md`.

## 1. Change detection & signal

- Mọi component `ChangeDetectionStrategy.OnPush`, state bằng signal.
- Dữ liệu dẫn xuất → `computed` / pipe thuần, không tính trong template hay method gọi từ template.
- Dữ liệu không hiển thị / không cần reactive → field thường (vd. `afterHistory`, `lastHitSort`).
- 1 thay đổi = 1 lần update signal; gộp các `update` liên tiếp.
- `effect` chỉ để đồng bộ ra ngoài (localStorage, DOM), không để set signal khác.

## 2. List

- Không render hết: bảng → phân trang; card / grid → infinite scroll; list rất dài (≥ vài trăm dòng trên DOM) → virtual scroll (hỏi trước khi thêm thư viện).
- Tra cứu nhiều lần theo id → `Map` / `Set` dựng 1 lần trong `computed`, không `find` / `includes` trong vòng lặp hoặc template.
- Không `JSON.stringify` để so sánh khi so sánh trực tiếp được.

## 3. Request

- Search: debounce 300–500ms, `trim()`, không gọi khi giá trị không đổi.
- Request độc lập → `forkJoin`, không nối chờ nhau.
- Không gọi API rồi bỏ kết quả.
- Sau tạo / sửa / xoá → cập nhật `rows` tại chỗ, không reload cả list nếu không cần.
- Danh mục nhiều nơi cùng cần → cache dùng chung (`code-standards.md` §5), không mỗi component tự fetch lại.

## 4. Lazy load

- Route → `loadComponent`. Modal → `await import()` khi mở.
- Phần nặng không hiện ngay (tab phụ, chart, lịch sử) → `@defer (on viewport | on interaction)` + `@placeholder`.
- Ảnh trong list → `loading="lazy"` + `width` / `height`.

## 5. Dọn dẹp

- `setTimeout` / `setInterval` → lưu id, `clearTimeout` trước khi đặt lại và khi destroy (`destroyRef.onDestroy`).
- Listener tự gắn (`addEventListener`) → gỡ khi destroy; ưu tiên `(event)` trong template / `host`.

## 6. Bundle & DOM

- Không thêm lodash / moment… khi native làm được. Xoá code / import / mock không còn dùng.
- Đọc kích thước DOM xong mới ghi style, không xen kẽ trong vòng lặp. Animation chỉ `transform` / `opacity`.
- Nội dung tải sau → giữ chỗ sẵn để không nhảy layout.
- Đo bằng Angular DevTools Profiler + Chrome Performance (long task > 50ms) + tab Network (request trùng / thừa); ghi số liệu trước / sau.
