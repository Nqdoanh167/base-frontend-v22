export const environment = {
  production: true,
  apiAddress: 'https://smax.app/api',
  apiModule: 'https://smax.app/api',
  urlDomain: 'https://smax.app',
  module: 'crm',
};

// Cùng 1 bản build chạy được trên mọi domain (dev.smax.app, smax.app, app.vn…): API theo origin đang mở.
const { hostname, origin } = new URL(location.href);
if (hostname !== 'localhost') {
  environment.apiAddress = `${origin}/api`;
  environment.apiModule = `${origin}/api`;
  environment.urlDomain = origin;
  environment.module = 'crm';
}
