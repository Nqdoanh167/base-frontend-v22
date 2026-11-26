import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsDaterangepickerDirective, BsDaterangepickerInputDirective } from 'ngx-bootstrap/datepicker';
import { buildDateRangePresets } from '@shared/utils/common.util';

@Component({
  selector: 'app-input-date-range',
  imports: [FormsModule, BsDaterangepickerDirective, BsDaterangepickerInputDirective],
  template: `
    <i class="icon calendar fa-regular fa-calendar" aria-hidden="true"></i>
    <input
      type="text"
      class="form-control"
      readonly
      bsDaterangepicker
      [placeholder]="placeholder()"
      [bsConfig]="config"
      [disabled]="disabled()"
      [ngModel]="value()"
      (ngModelChange)="onPick($event)"
      (blur)="onTouched()"
      container="body"
    />
    @if (clearable() && value() && !disabled()) {
      <button type="button" class="icon clear fa-solid fa-xmark" aria-label="Xoá khoảng ngày" (click)="onPick(null)"></button>
    }
  `,
  styleUrl: './input-date-range.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => InputDateRange) }],
})
export class InputDateRange implements ControlValueAccessor {
  readonly placeholder = input('Từ ngày → Đến ngày');
  readonly clearable = input(false);

  readonly config = {
    ranges: buildDateRangePresets(),
    rangeInputFormat: 'DD/MM/YYYY',
    showWeekNumbers: false,
    containerClass: 'theme-blue',
  };
  readonly value = signal<Date[] | null>(null);
  readonly disabled = signal(false);
  private onChange: (value: Date[] | null) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: Date[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: Date[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onPick(value: Date[] | null | undefined): void {
    this.value.set(value ?? null);
    this.onChange(value ?? null);
  }
}
