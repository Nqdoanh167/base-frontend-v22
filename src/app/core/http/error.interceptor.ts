import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { ToastService } from '../services/toast.service';

function resolveErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (typeof body === 'string' && body.trim() && !body.trim().startsWith('<')) {
    return body;
  }

  switch (error.status) {
    case 0:
      return 'Không thể kết nối máy chủ.';
    case 400:
      return 'Yêu cầu không hợp lệ.';
    case 401:
      return 'Phiên đăng nhập đã hết hạn.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu.';
    case 409:
      return 'Dữ liệu bị xung đột.';
    case 422:
      return 'Dữ liệu không hợp lệ.';
    case 500:
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    default:
      return error.message || 'Đã xảy ra lỗi.';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = resolveErrorMessage(error);
        logger.error(`HTTP ${error.status} ${req.method} ${req.url}`, error);
        toast.error(message);
      } else {
        logger.error(`Request failed ${req.method} ${req.url}`, error);
        toast.error('Đã xảy ra lỗi không xác định.');
      }

      return throwError(() => error);
    }),
  );
};
