import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  Injectable,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from '@core/http/auth.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { routes } from './app.routes';

// Deploy bản mới làm chunk lazy cũ 404 → reload để lấy bản mới.
const CHUNK_LOAD_ERROR = /Loading chunk [\d]+ failed|Failed to fetch dynamically imported module/;

@Injectable()
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error(error);
    if (error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)) window.location.reload();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAppInitializer(() => inject(AuthService).popular()),
  ],
};
