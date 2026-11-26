# CLAUDE.md

Đọc `README.md` + `docs/project-overview-pdr.md` trước khi implement. Rule chi tiết (bắt buộc đọc phần liên quan):
- `docs/code-standards.md` — đặt tên, component, function, state / fetch, form, modal, template, RxJS.
- `docs/performance-rules.md` — hiệu năng.
- `docs/design-guidelines.md` — styling, layout, responsive.

## 0. Ưu tiên & đồng bộ

**Thứ tự ưu tiên**: yêu cầu user > `CLAUDE.md` > `docs/*.md` > code hiện có > rule global (`~/.claude/rules/*`).
Override rule global: không giới hạn 200 dòng / không tách file nhỏ; comment tối thiểu; chỉ chain planner → tester → code-reviewer khi task lớn hoặc user yêu cầu.

1. Trước khi code: grep 2–3 module cùng loại (nếu có).
2. **Bắt buộc hỏi (`AskUserQuestion`)** khi: có ≥ 2 cách cho cùng 1 việc mà rule chưa chốt; rule mâu thuẫn nhau / với yêu cầu; cần tạo shared component / util hoặc thêm dependency. Câu hỏi nêu các cách + đề xuất.
3. User chốt → ghi 1 dòng (kèm Ref) vào đúng file `docs/`. Chỉ ghi vào `CLAUDE.md` khi là rule toàn cục. Giữ ngắn, không ghi ngày.
4. Code cũ lệch rule: không tự sửa ngoài scope — liệt kê cuối báo cáo + hỏi có chuẩn hoá không.

## 1. Stack & lệnh

- **Angular 22** standalone, **zoneless** → OnPush + signals mọi nơi. **TS strict**, **cấm `any`**.
- UI: **Bootstrap 5** + `@ng-select/ng-select`. Biến Bootstrap ở `src/styles/_variable.scss`, CSS global (form, ng-select, btn) ở `src/styles/custom.scss` — chỉ thêm khi dùng nhiều nơi. Style riêng 1 component → `.scss` của chính component đó (`@use 'styles/variable' as *`) khi utility Bootstrap không đủ.
- API qua `MainApiService` (`super('<endpoint>')` → `{apiAddress}/bizs/{alias}/<endpoint>`; backend module riêng → `super('<endpoint>', environment.apiModule)`) / `BaseApiService`, trả `EntityResult<T>`. Env: `environment.ts` (dev) / `environment.prod.ts` (build — `apiAddress`, `apiModule`, `urlDomain` lấy theo origin đang mở, trừ localhost); `module` = alias module trong app SMAX (`crm`). Chưa có API → `<feature>.mock.ts` cùng contract.
- **npm**. Node ≥ 22.22.3 / 24.15.0 — chạy `source ~/.nvm/nvm.sh && nvm use 24.15.0` trước mọi lệnh `npm` / `ng`.
- `npm start` · `npm run build` · `npm test` (Vitest) · `npm run lint`.

## 2. Cấu trúc

```
src/app/
├── core/      # singleton: http, guards, services, biz
├── shared/    # components (filter-panel), pipes, types, utils
├── layouts/ · admin/
└── main/<feature>/
    ├── components/              # modal, <feature>-filter, component dùng ≥ 2 chỗ
    ├── pages/                   # route page: gọi API, giữ state
    ├── <feature>-api.service.ts
    ├── <feature>.types.ts
    ├── <feature>.constants.ts
    ├── <feature>.utils.ts       # chỉ hàm thuần có unit test
    ├── <feature>.mock.ts        # chỉ khi chưa có API
    └── <feature>.routes.ts
```

- Không thêm `data-access/`, `facades/`, `dto/`, `mappers/`… Mỗi feature tối đa 1 file mỗi loại.
- **Chỉ tách component khi dùng ≥ 2 chỗ**. Ngoại lệ: modal, route page, `<feature>-filter`, phần của layout (`layouts/<layout>/components/`, vd. `main-sidebar`). Phần dùng 1 chỗ → `<ng-template #xxxTpl>` trong cha.
- File mới phải có lý do (dùng ≥ 2 nơi **và** chưa có file cùng nhóm).
- **Comment tối thiểu**: chỉ ghi điều không suy ra được từ code.

## 3. Cấm chung

- `rem`, hex ngoài `_variable.scss`, `window.confirm`.
- `<select>` → `<app-select>` (`shared/components/select`, CVA). Ng-select gốc chỉ khi cần `groupBy` / `addTag` / chip riêng — khi đó `appendTo="body"` + import directive `ng-*-tmp` tương ứng (thiếu thì ng-select âm thầm dùng template mặc định).
- Mọi input / textarea / ng-select có `placeholder`.
- Bộ lọc nâng cao → `<app-filter-panel>` (`shared/components/filter-panel`), không tự viết.
- Check `res.status === 200` trong `next` — lỗi đã vào `error` + interceptor.
- Validate bằng toast / `markAllAsTouched` → `Validators.required` + `isSubmitted` signal: `isSubmitted.set(true); if (this.form.invalid) return;`, template `[class.is-invalid]="isSubmitted() && form.get('x')?.invalid"` + `.invalid-feedback`.

## 4. Nghiệp vụ đã chốt

- Không có trang login: token ở `localStorage.smaxapp_token` (dùng chung app SMAX chính). `AuthService.popular()` lấy alias từ segment đầu URL → `GET bizs/{alias}/modules/{environment.module}` (biz + module + `viewer`); không alias → `GET users/me`. Chưa đăng nhập → về `location.origin` (app SMAX chính); localhost → trang 404 hiện lý do (`authError`), dev tự dán token. Chỉ xoá token khi API trả 401. Ref `core/services/auth.service.ts`.
- URL kiểu SMAX: `/{alias}/crm/<route>` — alias + module nằm ở `baseHref` (`angular.json`, dev `/demo/crm/` — đổi alias test tại đây), router phẳng: `''` → `MainLayout` (sidebar `layouts/main-layout/components/main-sidebar`, menu `SIDEBAR_MENU` trong `main-sidebar.ts`; logo / đổi biz-module = web component `<appvn-logo>` từ package `appvn` — import ESM trong sidebar + `CUSTOM_ELEMENTS_SCHEMA`, không thêm vào `angular.json` scripts) → `main/main.routes.ts`. Không dùng param `:bizAlias`. Page mới: thêm route vào `MAIN_ROUTES` + item vào `SIDEBAR_MENU`; đầu page đặt `<app-header>` (`shared/components/header`, slot `.left` tiêu đề / `.right` nút) — ref `main/home`.
