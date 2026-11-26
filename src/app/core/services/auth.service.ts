import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BizApi } from '@core/biz/biz.api';
import { environment } from '@environments/environment';
import { setMoneyFormat } from '@shared/pipes/format.pipe';
import { EntityResult } from '@shared/types/api.types';
import { Biz, ERole, User } from '@shared/types/viewmodels';

export const ACCESS_TOKEN_KEY = 'smaxapp_token';

// Không có trang login riêng: token `smaxapp_token` do app SMAX chính (cùng domain) ghi vào localStorage, dùng chung.
// Dev (localhost): thiếu token / 401 → tự đăng nhập bằng `environment.devBasicAuth`; không được thì tự dán token.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly bizApi = inject(BizApi);
  private readonly http = inject(HttpClient);

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
  async popular(canLoginInDev = true): Promise<void> {
    if (!this.getToken() && !(await this.loginInDev())) {
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
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          if (canLoginInDev && (await this.loginInDev())) return this.popular(false);
        }
        this._authError.set(`${err.status} ${err.error?.message || err.statusText} — ${err.url ?? ''}`);
      } else {
        this._authError.set(err instanceof Error ? err.message : String(err));
      }
    }
  }

  private async loginInDev(): Promise<boolean> {
    if (location.hostname !== 'localhost') return false;
    try {
      const res = await firstValueFrom(
        this.http.post<EntityResult<{ access_token?: string }>>(
          `${environment.apiAddress}/auth`,
          {},
          { headers: { Authorization: 'Basic bnFkY250dDIwMDJAZ21haWwuY29tOjEyMzQ1Ng==' } },
        ),
      );
      const token = res.data?.access_token;
      if (!token) return false;
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      return true;
    } catch {
      return false;
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
