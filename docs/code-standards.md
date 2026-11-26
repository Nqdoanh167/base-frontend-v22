# Code Standards

Áp dụng cho code mới và khi sửa code cũ. Hiệu năng: `performance-rules.md`. UI / styling: `design-guidelines.md`.

## 1. Đặt tên

| Loại | Kiểu | Ví dụ |
|---|---|---|
| Biến, field, function | camelCase | `selectedIds`, `getCustomers()` |
| Class, type, interface, component | PascalCase | `CustomerListPage`, `CustomerBody` |
| Const cấp module (ngoài class) | UPPER_SNAKE | `MAX_TAB`, `CUSTOMER_GENDERS` |
| File | kebab-case | `order-list.ts` |

- Boolean bắt đầu `is` / `has` / `can`. Mảng → số nhiều. `Set` id → `xxxIds`. `Map` tra cứu → `xxxById`.
- Không viết tắt (trừ `id`, `api`, `dto`, `url`). Biến 1 chữ chỉ trong callback ngắn.
- Tên nói ý nghĩa, không nói kiểu (`orders`, không `orderArray`).
- Form luôn tên `form`; signal list luôn tên `item`.

## 2. Type

- Không tiền tố `I`. Hậu tố cố định: `XxxBody` (body gửi lên), `XxxParams` (query); entity giữ tên gốc.
- `interface` cho object, `type` cho union / alias.
- Cấm `any` → `unknown` / type cụ thể. Không lặp type: `Customer['gender']`, `Pick`, `Partial`.

## 3. Component

Thứ tự trong class:
1. `inject(...)` — `private readonly`, service API tên `xxxApi`.
2. `input()` / `output()` / `model()`.
3. Signal state → 4. `computed` → 5. field thường không reactive.
6. Lifecycle → 7. method public (template gọi) → method `private` ở cuối.

- Field không gán lại → `readonly`. Chỉ template dùng → public, còn lại `private`.
- Magic number / string → const đầu file.

## 4. Function — mỗi động từ một nghĩa

| Tiền tố | Ý nghĩa | Ví dụ |
|---|---|---|
| `getXxx()` | Gọi API lấy data, ghi vào state | `getCustomers()`, `getTabs()` |
| `reloadXxx()` | Reset page / cursor / selection rồi gọi `getXxx()` | `reloadCustomers()` |
| `onXxx()` | Handler sự kiện template (kể cả mở modal) | `onSearch(value)`, `onCreate()` |
| `createXxx` / `updateXxx` / `deleteXxx` | Gọi API ghi | `deleteTab(id)` |
| `toXxx` / `buildXxx` | Hàm thuần map / dựng data | `toTab(view, i)` |

- Một function một việc; dài/lặp ≥ 2 lần mới tách.
- Early return, không lồng quá 2 cấp. > 3 tham số → gom 1 object.
- Luôn ghi kiểu trả về. Không để param / biến không dùng, không code comment.
- Ngoại lệ tên: nút đóng modal giữ `close()`.

## 5. State

- **Component giữ mọi state** bằng signal. API service stateless, chỉ method trả Observable.
- Data / paging / search → 1 `item = signal<EntityPagination<T>>({ rows, page, limit, total, loading, search, currentRow, after })`. Mutate bằng `item.update(s => ({ ...s, … }))`, đọc bằng destructuring. `currentRow` không clear khi đóng drawer.
- Flag cùng mục đích → 1 object signal đặt tên theo mục đích: `overlays = signal({ drawer: false, export: false })`, `loading = signal({ saving: false, categories: false })`. Signal riêng chỉ khi lifecycle khác (`selectedIds`, `activeTabId`).
- Signal đổi bằng `set` / `update` **immutable** — không mutate object / array / Set bên trong (`this.item().rows.push(x)` không render). Không dùng `cdr.detectChanges()` để chữa lỗi không render.
- Stream RxJS của service (vd. `AuthService`) đọc trong component bằng `toSignal()`.
- **Danh mục dùng chung nhiều module**: ngoại lệ duy nhất cho API service giữ state — cache signal ở root service, load 1 lần; sau CRUD gọi `loadXxx(true)`.

## 6. Fetch & kết quả API

```ts
private getCustomers(): void {
  if (this.item().loading) return;
  this.item.update((s) => ({ ...s, loading: true }));

  const { page, limit, search } = this.item();
  const params: Record<string, unknown> = { page, limit };
  if (search?.trim()) params['q'] = search.trim();

  this.customerApi.customer
    .get(params)
    .pipe(
      finalize(() => this.item.update((s) => ({ ...s, loading: false }))),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (res) => this.item.update((s) => ({ ...s, rows: res.data ?? [], total: res.meta?.total ?? res.total ?? 0 })),
      error: () => this.item.update((s) => ({ ...s, rows: [], total: 0 })),
    });
}

reloadCustomers(): void {
  this.item.update((s) => ({ ...s, page: 1, after: null }));
  this.getCustomers();
}
```

- Search / tab / page size → update `item` rồi `reloadXxx()`; đổi trang → `getXxx()`. Không `Subject` + `switchMap` (`load$`).
- Guard `loading` bỏ qua request mới khi đang tải là **chủ đích** — không huỷ request cũ, không báo lỗi khi review.
- `params`: field luôn có trước, field tuỳ chọn thêm có điều kiện — không gửi giá trị rỗng / `'all'`.
- Lỗi HTTP đã vào `error` và `error.interceptor` đã toast → trong `next` **không** check `res.status === 200`, `error` chỉ reset state.
- Chuẩn hoá một chỗ: `rows: res.data ?? []`, `total: res.meta?.total ?? res.total ?? 0`.

- Mock: dữ liệu 1 file `<feature>.mock.ts`, đánh dấu `// TODO(api):` chỗ cần thay API thật.

## 7. Danh sách & phân trang

- **Bảng**: phân trang server (`page`, `limit`, `total` trong `item`).
- **Cursor** (`after`): giữ stack `afterHistory` (field thường) — Next push, Prev pop; reload → reset stack.
- **Search**: debounce 400ms, emit giá trị thô — trim khi dựng params.

## 8. Form

```ts
readonly form = this.fb.group({
  name: ['', Validators.required],
  type: [null as TriggerType | null],
  cases: this.fb.array([]),
});
get cases(): FormArray { return this.form.get('cases') as FormArray; }
```

- Control là array literal; không `fb.control<T>()` / `fb.nonNullable` / `new FormControl<T>()`. Cast inline khi cần.
- Ngoại lệ: control có **giá trị là mảng** → `this.fb.control<T[] | null>(…)`.
- Tên field khớp payload API.
- Validate: `Validators.required` trong form, `isSubmitted` signal, `save()` → `isSubmitted.set(true); if (this.form.invalid) return;`; template `[class.is-invalid]="isSubmitted() && form.get('x')?.invalid"` + `<div class="invalid-feedback">`. Không toast validate / `markAllAsTouched`.
- Select → `<app-select>` (`formControlName` / `ngModel`): `[items]`, `bindLabel` (mặc định `name`), `bindValue` (mặc định `id`), `[multiple]`, `[invalid]`. Item có `picture` / `icon` / `avatar` tự hiện ảnh (URL) hoặc icon Font Awesome. Nội dung riêng → `[optionTemplate]="xxxTpl"` + `<ng-template #xxxTpl let-item>`; footer → `[footerTemplate]`. Không mở thêm input khi chưa có chỗ dùng.

## 9. Modal

- Chưa có thư viện modal trong base — khi cần, **hỏi trước** khi thêm (`ngx-bootstrap` / `@angular/cdk/dialog` / component tự viết).
- Component modal tải lazy bằng `await import()` ngay trong `onXxx()`; trả kết quả qua field `result`.
- Xem / thêm / sửa cùng entity → 1 modal `<feature>-detail` có chế độ.

## 10. Template

- **Bố cục**: đầu file là khung sườn (`@if` / `@for` cấp 1 + `<ng-container [ngTemplateOutlet]="xxxTpl" />`); mỗi phần là 1 `<ng-template #xxxTpl>` phẳng ở cuối, đúng thứ tự. Không lồng `@if` quá 2 cấp. Template tự lấy data bằng `@let`, chỉ truyền `context` khi dùng lại với data khác.
- **Reactive Forms**: thẻ gốc `<form [formGroup]="form">` bọc cả các template (`ng-template` lấy injector ở chỗ khai báo); `(keydown.enter)` đặt ở `fieldset`. `ngModel` trong form → `[ngModelOptions]="{ standalone: true }"`.
- Không gọi method có tính toán → `computed` / pipe. Tra theo key trong `@for` → `computed` trả `Map` / `Set`.
- Đọc signal của service trong template được phép.
- `@for` luôn `track` theo id. Biểu thức dùng ≥ 2 lần → `@let`.
- Handler đặt tên theo sự kiện, không chứa logic: `(click)="onDelete(row)"`.

## 11. RxJS

- Hậu tố `$` chỉ cho biến / field là stream, không cho function.
- `subscribe` trong component → `takeUntilDestroyed(this.destroyRef)` (trừ modal đã tự complete). Root service không cần.
- Nối tiếp → `switchMap`; song song → `forkJoin`; không `subscribe` lồng.

## 12. Routing — path nhiều segment

`../` lùi theo **segment URL**, không theo cây route. Từ `/report/zns` tới sibling `template` → `['../../template']`. Route sibling khai phẳng (`{ path: 'report/zns' }`), không lồng `children` khi cần điều hướng `../`.
