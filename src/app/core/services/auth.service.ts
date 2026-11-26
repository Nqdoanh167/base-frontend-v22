import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BizApi } from '@core/biz/biz.api';
import { setMoneyFormat } from '@shared/pipes/format.pipe';
import { Biz, ERole, User } from '@shared/types/viewmodels';

export const ACCESS_TOKEN_KEY = 'smaxapp_token';

// Không có trang login riêng: token `smaxapp_token` do app SMAX chính (cùng domain) ghi vào localStorage, dùng chung.
// Dev: tự dán token vào `localStorage.smaxapp_token` rồi mở `/<bizAlias>/crm/` (base href).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly bizApi = inject(BizApi);

  private readonly _user = signal<User | null>(null);
  private readonly _biz = signal<Biz | null>(null);
  private readonly _authError = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly biz = this._biz.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly authError = this._authError.asReadonly();
  readonly isAdmin = computed(() => this._user()?.role === ERole.ADMIN);

  constructor() {
    effect(() => setMoneyFormat(this._biz()?.currency));
  }

  /** App initializer: `GET bizs/{alias}` trả cả biz + `viewer`. */
  async popular(): Promise<void> {
    if (!this.getToken()) {
      this._authError.set(`Chưa có token: set localStorage['${ACCESS_TOKEN_KEY}'] rồi tải lại trang.`);
      return;
    }
    const alias = 'test';
    try {
      const res = await firstValueFrom(this.bizApi.get(alias));
      if (!res.data?.id || !res.viewer) throw new Error(`Không tải được biz "${alias}" (thiếu data / viewer).`);
      this._biz.set(res.data);
      this._user.set(res.viewer);
    } catch (err) {
      // Chỉ token hết hạn / sai mới xoá; lỗi khác (sai alias, mạng, 5xx) giữ token để thử lại.
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) localStorage.removeItem(ACCESS_TOKEN_KEY);
        this._authError.set(`${err.status} ${err.error?.message || err.statusText} — ${err.url ?? ''}`);
      } else {
        this._authError.set(err instanceof Error ? err.message : String(err));
      }
    }
  }

  getToken(): string {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
  }

  /**
   * Về app SMAX chính (cùng origin) để đăng nhập. Localhost không có app đó — origin lại 302 về base href
   * → lặp vô hạn, nên trả false để guard hiện trang báo lỗi.
   */
  redirectToLogin(): boolean {
    if (location.hostname === 'localhost') return false;
    window.location.href = location.origin;
    return true;
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (!this.redirectToLogin()) window.location.reload();
  }
}
