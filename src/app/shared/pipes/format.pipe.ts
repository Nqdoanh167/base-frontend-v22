import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, signal } from '@angular/core';

export interface MoneyFormat {
  symbol: string;
  thousandSeparator: string;
}

const DEFAULT_MONEY_FORMAT: MoneyFormat = { symbol: '₫', thousandSeparator: ',' };
const FIXED_VND_FORMAT: MoneyFormat = { symbol: 'đ', thousandSeparator: ',' };

// Theo `biz.currency` (AuthService set khi đổi biz) — giống `input-mask` legacy.
export const moneyFormat = signal<MoneyFormat>(DEFAULT_MONEY_FORMAT);

export function setMoneyFormat(currency: Partial<MoneyFormat> | null | undefined): void {
  moneyFormat.set({
    symbol: currency?.symbol || DEFAULT_MONEY_FORMAT.symbol,
    thousandSeparator: currency?.thousandSeparator ?? DEFAULT_MONEY_FORMAT.thousandSeparator,
  });
}

export function formatMoneyNumber(value: number, format = moneyFormat()): string {
  const digits = String(Math.round(Math.abs(value)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandSeparator);
  return value < 0 && grouped !== '0' ? `-${grouped}` : grouped;
}

export function formatVnd(value: number | null | undefined, empty = '—', fixed = false): string {
  if (value == null || !Number.isFinite(value)) return empty;
  const format = fixed ? FIXED_VND_FORMAT : moneyFormat();
  return `${formatMoneyNumber(value, format)}${format.symbol}`;
}

@Pipe({ name: 'vnd' })
export class VndPipe implements PipeTransform {
  transform(value: number | null | undefined, empty = '—', fixed = false): string {
    return formatVnd(value, empty, fixed);
  }
}

const COMPACT_UNITS = [
  { value: 1e9, suffix: ' tỷ', digits: 2 },
  { value: 1e6, suffix: ' triệu', digits: 1 },
  { value: 1e3, suffix: 'K', digits: 1 },
];

export function formatCompact(value: number | null | undefined, money = false, empty = '—'): string {
  if (value == null || !Number.isFinite(value)) return empty;
  const format = moneyFormat();
  const unit = COMPACT_UNITS.find((u) => Math.abs(value) >= u.value);
  const text = unit
    ? `${String(Number((value / unit.value).toFixed(unit.digits))).replace('.', format.thousandSeparator === '.' ? ',' : '.')}${unit.suffix}`
    : formatMoneyNumber(value, format);
  return money ? `${text}${format.symbol}` : text;
}

@Pipe({ name: 'compact' })
export class CompactPipe implements PipeTransform {
  transform(value: number | null | undefined, money = false, empty = '—'): string {
    return formatCompact(value, money, empty);
  }
}

const DATE_FORMATS = {
  datetime: 'dd/MM/yyyy HH:mm',
  date: 'dd/MM/yyyy',
  time: 'HH:mm',
  seconds: 'dd/MM/yyyy HH:mm:ss',
  short: 'dd/MM HH:mm',
} as const;

export function formatAppDate(
  value: string | number | Date | null | undefined,
  format: keyof typeof DATE_FORMATS = 'datetime',
  empty = '—',
): string {
  if (value == null || value === '') return empty;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? empty : formatDate(d, DATE_FORMATS[format], 'en-US');
}

@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  transform(
    value: string | number | Date | null | undefined,
    format: keyof typeof DATE_FORMATS = 'datetime',
    empty = '—',
  ): string {
    return formatAppDate(value, format, empty);
  }
}
