# Angular Base

Angular 22 starter tối giản: standalone, zoneless, signals, TS strict, Bootstrap 5 + ng-select, Vitest.

## Setup

Node **v22.22.3+ / v24.15.0+**.

```bash
nvm use 24.15.0
npm install
npm start         # http://localhost:4400/demo/crm/
```

Đăng nhập dev: không có trang login — đăng nhập dev.smax.app, copy access token vào `localStorage.smaxapp_token` (DevTools) rồi mở `http://localhost:4400/demo/crm/` (đổi alias test ở `baseHref` trong `angular.json`).

## Commands

| Command | |
|---|---|
| `npm start` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

## Structure

```
src/app/
├── core/      # biz, guards, http (interceptors, base api), services
├── shared/    # components (filter-panel), pages (not-found), pipes, types, utils
├── layouts/   # main-layout (sidebar), admin-layout
├── main/      # main.routes.ts, home
├── admin/     # dashboard
├── app.routes.ts
├── app.config.ts
└── app.ts
```

Rule code: `CLAUDE.md`, `docs/`.
