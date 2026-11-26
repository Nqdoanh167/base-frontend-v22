import { afterEach, describe, expect, it } from 'vitest';
import { AppDatePipe, CompactPipe, VndPipe, setMoneyFormat } from './format.pipe';

describe('VndPipe', () => {
  const pipe = new VndPipe();

  afterEach(() => setMoneyFormat(null));

  it('formats with default currency (comma + ₫)', () => {
    expect(pipe.transform(1250000)).toBe('1,250,000₫');
    expect(pipe.transform(0)).toBe('0₫');
    expect(pipe.transform(-20000.4)).toBe('-20,000₫');
  });

  it('follows biz currency', () => {
    setMoneyFormat({ symbol: 'đ', thousandSeparator: '.' });
    expect(pipe.transform(1250000)).toBe('1.250.000đ');
  });

  it('returns the empty marker for null/NaN', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(Number.NaN, '-')).toBe('-');
  });
});

describe('CompactPipe', () => {
  const pipe = new CompactPipe();

  afterEach(() => setMoneyFormat(null));

  it('shortens large numbers to tỷ / triệu / K', () => {
    expect(pipe.transform(1_000_000_000)).toBe('1 tỷ');
    expect(pipe.transform(15_850_000_000)).toBe('15.85 tỷ');
    expect(pipe.transform(3_703_271)).toBe('3.7 triệu');
    expect(pipe.transform(128_400)).toBe('128.4K');
    expect(pipe.transform(950)).toBe('950');
    expect(pipe.transform(-2_500_000)).toBe('-2.5 triệu');
  });

  it('appends currency symbol and follows biz decimal separator', () => {
    expect(pipe.transform(4_250_000, true)).toBe('4.3 triệu₫');
    setMoneyFormat({ symbol: 'đ', thousandSeparator: '.' });
    expect(pipe.transform(15_850_000_000, true)).toBe('15,85 tỷđ');
  });

  it('returns the empty marker for null/NaN', () => {
    expect(pipe.transform(null)).toBe('—');
  });
});

describe('AppDatePipe', () => {
  const pipe = new AppDatePipe();
  const d = new Date(2026, 9, 2, 9, 5, 7);

  it('uses dd/MM/yyyy HH:mm by default and supports presets', () => {
    expect(pipe.transform(d)).toBe('02/10/2026 09:05');
    expect(pipe.transform(d, 'date')).toBe('02/10/2026');
    expect(pipe.transform(d, 'time')).toBe('09:05');
    expect(pipe.transform(d, 'seconds')).toBe('02/10/2026 09:05:07');
    expect(pipe.transform(d, 'short')).toBe('02/10 09:05');
  });

  it('returns the empty marker for empty/invalid input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('bad')).toBe('—');
  });
});
