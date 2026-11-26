import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@environments/environment';

export abstract class BaseApiService {
  private apiAddress = environment.apiAddress;

  protected readonly http = inject(HttpClient);

  protected createParams(params: Record<string, unknown>): HttpParams {
    return Object.keys(params).reduce((m, k) => {
      const value = params[k];
      if (value != null) {
        return m.set(k, String(value));
      }
      return m;
    }, new HttpParams());
  }

  protected createUrl(paths: string[]) {
    return this.apiAddress + '/' + paths.join('/');
  }

  public setApiAddress(apiAddress: string, endpoint: string) {
    this.apiAddress = apiAddress + '/' + endpoint;
    if (this.apiAddress.endsWith('/')) {
      this.apiAddress = this.apiAddress.replace(/\/+$/, '');
    }
  }
}
