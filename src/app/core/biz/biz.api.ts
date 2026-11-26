import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/http/base-api.service';
import { environment } from '@environments/environment';
import { EntityResult } from '@shared/types/api.types';
import { Biz, BizRole, Branch, User } from '@shared/types/viewmodels';

interface CreateBizPayload {
  name: string;
  alias: string;
  email: string;
  phone: string;
}

/** Body for `POST bizs/{alias}/roles` (`id: null`, create) / `PUT bizs/{alias}/roles/{id}` (update). */
export interface BizRoleDto {
  id: string | null;
  name: string;
  desc: string | null;
  icon: string;
  isActive: boolean;
}

/** Body for `POST bizs/{alias}/branches` (`id: null`, create) / `PUT bizs/{alias}/branches/{id}` (update). */
export interface BranchDto {
  id: string | null;
  departmentId: string | null;
  name: string;
  desc: string | null;
  phone: string;
  address: string;
  isActive: boolean;
}

export type BizMemberRole = 'OWNER' | 'MEMBER';

/** Body for `POST bizs/{alias}/users` (add) and `PUT bizs/{alias}/users/{id}` (update). */
export interface BizUserDto {
  name: string | null;
  picture: string | null;
  email: string;
  phone: string | null;
  role: BizMemberRole;
  groupIds: string[];
  roleIds: string[];
  branchIds: string[];
  roleBranches: {
    id: string;
    role: BizMemberRole;
    departments: { id: string; role: BizMemberRole; teams: { id: string; role: BizMemberRole }[] }[];
  }[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BizApi extends BaseApiService {
  getMe(): Observable<EntityResult<User>> {
    return this.http.get<EntityResult<User>>(this.createUrl(['users', 'me']));
  }

  /** `PUT users/{id}` — currently only used to pin the default biz. */
  updateUser(id: string, body: { defaultBiz: string }): Observable<EntityResult<User>> {
    return this.http.put<EntityResult<User>>(this.createUrl(['users', id]), body);
  }

  /** Biz + module hiện tại (`module`, `modules`, `groups`) + `viewer` — đủ dữ liệu cho `<appvn-logo>`. */
  get(alias: string): Observable<EntityResult<Biz>> {
    const url = this.createUrl(['bizs', alias, 'modules', environment.module]);
    return this.http.get<EntityResult<Biz>>(url);
  }

  list(limit = 100): Observable<EntityResult<Biz[]>> {
    const params = this.createParams({ limit });
    return this.http.get<EntityResult<Biz[]>>(this.createUrl(['bizs']), { params });
  }

  create(payload: CreateBizPayload): Observable<EntityResult<Biz>> {
    return this.http.post<EntityResult<Biz>>(this.createUrl(['bizs']), payload);
  }

  // Write-only: lists are read from `GET bizs/{alias}` (AuthService.biz).
  // POST always inserts on the backend, so an existing id must go through PUT.
  readonly roles = {
    save: (alias: string, body: BizRoleDto): Observable<EntityResult<BizRole>> =>
      body.id
        ? this.http.put<EntityResult<BizRole>>(this.createUrl(['bizs', alias, 'roles', body.id]), body)
        : this.http.post<EntityResult<BizRole>>(this.createUrl(['bizs', alias, 'roles']), body),
  };

  readonly branches = {
    save: (alias: string, body: BranchDto): Observable<EntityResult<Branch>> =>
      body.id
        ? this.http.put<EntityResult<Branch>>(this.createUrl(['bizs', alias, 'branches', body.id]), body)
        : this.http.post<EntityResult<Branch>>(this.createUrl(['bizs', alias, 'branches']), body),
  };

  readonly users = {
    add: (alias: string, body: BizUserDto): Observable<EntityResult<User>> =>
      this.http.post<EntityResult<User>>(this.createUrl(['bizs', alias, 'users']), body),
    update: (alias: string, id: string, body: BizUserDto): Observable<EntityResult<User>> =>
      this.http.put<EntityResult<User>>(this.createUrl(['bizs', alias, 'users', id]), body),
  };
}
