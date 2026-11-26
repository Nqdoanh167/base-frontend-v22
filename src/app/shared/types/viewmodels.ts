export enum ERole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MOD = 'MOD',
  MEMBER = 'MEMBER',
}

export interface Team {
  id: string;
  level?: string;
  branchId?: string;
  name: string;
  desc: string;
  role?: ERole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface Department extends Team {
  teams: Team[];
  children?: unknown;
}
export interface Branch extends Team {
  phone?: string;
  address?: string;
  departmentId?: string | null;
  departments: Department[];
  children?: unknown;
}

export interface BizModule {
  id: string;
  name: string;
  alias: string;
  icon: string;
  isActive: true;
  isDefault: false;
  isInside: false;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
  groupIds: string[];
  package?: {
    options?: {
      sidebarEnables: { key: string; value: boolean }[];
    };
  };
}

export interface Biz {
  branches: Branch[];
  id: string;
  alias: string;
  authorId?: string;
  author?: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
  name: string;
  email?: string;
  phone?: string;
  picture?: string;
  isActive: boolean;
  currency: {
    code: string;
    exchangeRates: string[];
    mask: string;
    name: string;
    symbol: string;
    thousandSeparator: string;
  };

  module: BizModule;
  modules: BizModule[];
  quickModules: string[];
  groups: BizGroup[];
  roles: BizRole[];
  user: User;
  users: User[];
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
  location: string;
  useNewLocationSet?: boolean;
  package?: { expired?: number | string | null };
}

export interface IPosLastBranches {
  id: string;
  name: string;
  role: ERole;
  userIds?: string[];
}
export interface FlatBranch {
  id: string;
  name: string;
  role: ERole;
  userIds: string[]; // all user in this unit
}

export interface BizGroup {
  id: string;
  name: string;
  desc: string;
  modules: BizModule[];
  scopeIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BizRole {
  id: string;
  desc: string;
  icon: string;
  isActive: boolean;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  address?: string;
  picture: string;
  gender?: string;
  birthday?: string;
  role: ERole;
  biz: Biz;
  quickModules: string[];
  services: {
    facebooks?: string[];
    googles?: string[];
  };
  groupIds?: string[];
  branches: Branch[];
  flatBranchIds?: string[];
  roleBranches: Branch[];
  posLastBranches: IPosLastBranches[];
  flatBranches: FlatBranch[];
  branchIds: string[];
  groups?: BizGroup[];
  roleIds?: string[];
  roles?: BizRole[];
  isActive: boolean;
  moduleAliases: string[];
  modules: BizModule[];
  createdAt?: Date;
  modScope: {
    moduleAlias: string;
    moduleScopes: string[];
    name: string;
    picture: string;
    role: string;
  };
  defaultBiz: string;
}

export interface IAccountPublic {
  id: string;
  name: string;
  email: string;
  role: string;
  roleIds: string[];
  isActive: boolean;
  picture: string;
  createdAt: string;
  isFollowReport?: boolean;
}

export type ITypePaginate = 'number' | 'lazy';
export type IChangePage = 'before' | 'after';

export enum SourcePlatform {
  FACEBOOK = 'FACEBOOK',
  TIKTOK = 'TIKTOK',
  ZALO = 'ZALO',
  SHOPEE = 'SHOPEE',
}
