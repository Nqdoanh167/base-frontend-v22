export function toggleId(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}

export function togglePage(set: ReadonlySet<string>, pageIds: string[]): Set<string> {
  const next = new Set(set);
  const all = pageIds.length > 0 && pageIds.every((id) => set.has(id));
  pageIds.forEach((id) => (all ? next.delete(id) : next.add(id)));
  return next;
}

const pad = (n: number): string => String(n).padStart(2, '0');

export function toDateTimeLocal(value: Date | string | null | undefined): string {
  if (value == null || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateTimeLocal(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Bỏ dấu tiếng Việt + lowercase + trim — so khớp tìm kiếm client-side.
export function normalizeSearch(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// `row.value` từ bsDaterangepicker = `Date[]` (from, to) → mốc ms đầu/cuối ngày.
export function dateRangeMs(value: unknown): { after?: number; before?: number } {
  if (!Array.isArray(value)) return {};
  const [from, to] = value;
  return {
    after: from instanceof Date ? new Date(from).setHours(0, 0, 0, 0) : undefined,
    before: to instanceof Date ? new Date(to).setHours(23, 59, 59, 999) : undefined,
  };
}

export function parseExpiry(raw: number | string | null | undefined): Date | null {
  if (raw == null || raw === '') return null;
  const date = new Date(typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : raw);
  return isNaN(date.getTime()) ? null : date;
}

export function isPackageExpired(raw: number | string | null | undefined): boolean {
  const date = parseExpiry(raw);
  return !date || date.getTime() <= Date.now();
}

export interface DateRangePreset {
  key: string;
  label: string;
  value: Date[];
}

// Cắt preset theo `minDate` / `maxDate` (vd. "Tuần này" không vượt hôm nay); preset nằm hẳn trước `minDate` bị bỏ.
export function buildDateRangePresets(maxDate?: Date | null, minDate?: Date | null): DateRangePreset[] {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const now = new Date();
  const today = startOf(now);
  const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -((today.getDay() + 6) % 7));
  const lastWeekStart = addDays(weekStart, -7);
  const max = maxDate ? endOf(maxDate) : null;
  const min = minDate ? startOf(minDate) : null;
  const range = (from: Date, to: Date): Date[] => {
    let [f, t] = [from, endOf(to)];
    if (max && t > max) [f, t] = [f > max ? startOf(max) : f, max];
    if (min && f < min) f = min;
    return [f, t];
  };
  const presets: DateRangePreset[] = [
    { key: 'today', label: 'Hôm nay', value: range(today, today) },
    { key: 'yesterday', label: 'Hôm qua', value: range(yesterday, yesterday) },
    { key: 'thisWeek', label: 'Tuần này', value: range(weekStart, addDays(weekStart, 6)) },
    { key: 'lastWeek', label: 'Tuần trước', value: range(lastWeekStart, addDays(lastWeekStart, 6)) },
    {
      key: 'thisMonth',
      label: 'Tháng này',
      value: range(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    },
    {
      key: 'lastMonth',
      label: 'Tháng trước',
      value: range(new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)),
    },
    {
      key: 'last3Months',
      label: '3 tháng',
      value: range(
        new Date(now.getFullYear(), now.getMonth() - 3, Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth() - 2, 0).getDate())),
        today,
      ),
    },
  ];
  return presets.filter((p) => p.value[0] <= p.value[1]);
}
