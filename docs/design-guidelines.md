# Design Guidelines

Quy ước code: `code-standards.md`.

## 1. Shared có sẵn

| Cần | Dùng |
|---|---|
| Bộ lọc nâng cao | `<app-filter-panel [filterDefs] (filterApply) (keySelect)>` + `<ng-template #valueCell let-row let-update="update">` cho ô giá trị (`(ngModelChange)="update({ value: $event })"`) |
| Tiền / ngày | pipe `vnd`, `compact`, `appDate` — `@shared/pipes/format.pipe` |
| Segment / toggle | `btn-group` + `btn-check` Bootstrap |
| Select | `<app-select>` — `shared/components/select` |
| Header page | `<app-header>` + `<h1 class="left">` / `<div class="right">` — `shared/components/header` (menu user có sẵn) |

## 2. Styling

- **Bootstrap 5**: dùng utility / component Bootstrap trước. Biến (màu, gray, radius, font-size) ở `src/styles/_variable.scss`; CSS global (form-control, ng-select, btn, `fs-*`, `line-clamp-*`, `min-w-0`) ở `src/styles/custom.scss`.
- Thiếu utility → `style` inline ngắn; nhiều hơn → `.scss` của component (`@use 'styles/variable' as *`, màu / kích thước lấy từ biến). Style dùng nhiều nơi → `custom.scss` (hỏi trước). Ref `layouts/main-layout/components/main-sidebar/main-sidebar.scss`.
- Đơn vị `px`, cấm `rem`. Màu → class / CSS variable Bootstrap (`text-primary`, `var(--bs-border-color)`), không hex.
- Nút chính `btn-primary`; phụ `btn-outline-secondary`.

## 3. Responsive

- Dùng được ở **375 / 768 / ≥ 1280px** — không tràn ngang, không vỡ layout.
- Chỉ breakpoint Bootstrap (`sm 576` / `md 768` / `lg 992` / `xl 1200` / `xxl 1400`).
- Bảng cuộn ngang (`table-responsive`), không bóp cột; toolbar / filter xếp dọc `< md`; modal `modal-fullscreen-sm-down`.
