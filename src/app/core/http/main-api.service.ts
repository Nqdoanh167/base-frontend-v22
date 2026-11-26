import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';
import { BaseApiService } from './base-api.service';

export abstract class MainApiService extends BaseApiService {
  private readonly authService = inject(AuthService);

  constructor(
    private readonly endpoint: string,
    private readonly apiBase = environment.apiAddress,
  ) {
    super();
  }

  protected override createUrl(paths: string[]): string {
    const biz = this.authService.biz();
    const base = biz ? `${this.apiBase}/bizs/${biz.alias}/${this.endpoint}` : this.apiBase;
    // Bỏ segment rỗng (vd. `paths.customer = ''`) để không sinh `//` hay `/` thừa cuối URL.
    return `${base}/${paths.filter(Boolean).join('/')}`;
  }
}
