import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  output,
  Pipe,
  PipeTransform,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  NgFooterTemplateDirective,
  NgHeaderTemplateDirective,
  NgLabelTemplateDirective,
  NgMultiLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';

const FA_STYLE = /^(fa|fas|far|fab|fal|fad|fat|fa-(solid|regular|brands|light|thin|duotone))\s/;
const SEARCH_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'];

// picture || icon || avatar: có "/" hoặc ":" là URL ảnh, còn lại là class Font Awesome (thiếu prefix style → thêm "fa").
@Pipe({ name: 'selectMedia' })
export class SelectMediaPipe implements PipeTransform {
  transform(item: { picture?: unknown; icon?: unknown; avatar?: unknown }): { src?: string; cls?: string } | null {
    const value = item.picture || item.icon || item.avatar;
    if (!value || typeof value !== 'string') return null;
    if (/[/:]/.test(value)) return { src: value };
    return { cls: FA_STYLE.test(value) ? value : `fa ${value}` };
  }
}

@Component({
  selector: 'app-select',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    NgSelectComponent,
    NgHeaderTemplateDirective,
    NgFooterTemplateDirective,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,
    NgMultiLabelTemplateDirective,
    SelectMediaPipe,
  ],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  readonly items = input<readonly object[]>([]);
  readonly bindLabel = input('name');
  readonly bindValue = input('id');
  readonly multiple = input(false);
  readonly maxLabels = input(2);
  readonly placeholder = input('Lựa chọn…');
  readonly searchPlaceholder = input('Tìm kiếm…');
  readonly searchable = input(true);
  readonly clearable = input(true);
  readonly loading = input(false);
  readonly invalid = input(false);
  readonly appendTo = input('body');
  readonly labelForId = input<string | null>(null);
  readonly notFoundText = input('Không tìm thấy');

  readonly searchChange = output<{ term: string }>();
  readonly scrollToEnd = output<void>();
  readonly opened = output<void>();

  // Nội dung item riêng (màu, icon, thụt cấp) — context `let-item`; ảnh vẫn tự render trước.
  readonly optionTemplate = input<TemplateRef<unknown>>();
  readonly footerTemplate = input<TemplateRef<unknown>>();

  private readonly select = viewChild.required(NgSelectComponent);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly value = signal<unknown>(null);
  readonly disabled = signal(false);
  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  constructor() {
    // Ô search chỉ render khi panel mở → focus ngay khi xuất hiện.
    effect(() => this.searchInput()?.nativeElement.focus());
  }

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onModelChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }

  // Panel appendTo ngoài host → tự forward phím điều hướng; chặn bubble để ng-select không nuốt Space khi panel nằm trong host.
  onSearchKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (SEARCH_KEYS.includes(event.key)) this.select().handleKeyCodeInput(event);
  }
}
