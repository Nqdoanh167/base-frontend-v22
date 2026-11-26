# Project Overview

Angular 22 starter tối giản cho app Smax / CDP: chỉ giữ hạ tầng (auth, http, guard, layout), không có module nghiệp vụ.

## Nguyên tắc

**Simple → Consistent → Scalable → Maintainable**. Không thêm abstraction / thư viện khi chưa có chỗ dùng thật.

## Stack

- Angular 22 standalone, zoneless, signals, TS strict.
- Bootstrap 5 (biến `styles/_variable.scss`, CSS global `styles/custom.scss`) + ng-select qua `<app-select>`.
- Vitest, ESLint (angular-eslint), Prettier.

## Kiến trúc

- `core/` — hạ tầng singleton: `http/` (`BaseApiService`, `MainApiService`, interceptor auth / error / loading, context token `SKIP_LOADING` / `SKIP_ERROR_TOAST`), `biz/` (`BizApi`), `guards/` (auth, admin), `services/` (auth — token từ app SMAX chính, không có trang login; toast, logger).
- `shared/` — chỉ thứ dùng ≥ 2 feature: `components/` (header, select, filter-panel), `pipes/` (format, safeHtml), `types/` (`EntityResult<T>`, viewmodels), `utils/`, `pages/not-found`.
- `layouts/` — `main-layout` (khu `/{alias}/crm/`, `components/main-sidebar`), `admin-layout`.
- `main/` — `main.routes.ts` + `home` (trang mẫu).
- `app.config.ts` — `GlobalErrorHandler` reload khi tải chunk lazy lỗi (sau deploy).
- `main/<feature>/` — feature mới, cấu trúc phẳng theo `CLAUDE.md` §2.

## API

- Response chuẩn `EntityResult<T>` (`shared/types/api.types.ts`).
- Lỗi HTTP xử lý tập trung ở `error.interceptor`; component chỉ reset state trong `error`.
- Chưa có API → `<feature>.mock.ts` cùng contract, đổi sang API thật chỉ thay service.

## Anti-goals

- Không NgModule, không state library (NgRx…), không Tailwind / CSS framework thứ 2.
- Không tạo shared component trước khi có ≥ 2 chỗ dùng.
