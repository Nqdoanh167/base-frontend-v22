import type { User } from './viewmodels';

export interface IMetaData {
  total: number;
  totalPage: number;
  countRows: number;
  currentPage: number;
  limit: number;
  after?: string;
  lastHitSort?: string[];
}

export interface EntityResult<T> {
  status: number;
  statusText: string;
  subStatus: string;
  subStatusText: string;
  message: string;
  refToken?: string;
  total: number;
  data: T;
  viewer?: User;
  meta?: IMetaData;
}

export interface EntityPagination<T> {
  rows: T[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  search?: string;
  currentRow?: T | null;
  after?: string[] | null;
}

export interface EntityState<T> {
  rows: T[];
  loading: boolean;
}
