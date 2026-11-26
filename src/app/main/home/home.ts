import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { InputDateRange } from '@shared/components/input-date-range/input-date-range';
import { Select } from '@shared/components/select/select';
import { MainHeader } from 'src/app/layouts/main-layout/components/main-header/main-header';

@Component({
  selector: 'app-home',
  imports: [MainHeader, Select, InputDateRange, FormsModule],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly biz = this.auth.biz;
  readonly periods = [
    { id: 'today', name: 'Hôm nay' },
    { id: '7d', name: '7 ngày qua' },
    { id: '30d', name: '30 ngày qua' },
  ];
  readonly stats = [
    { id: 'customers', name: 'Khách hàng', value: 0, icon: 'fa-solid fa-users' },
    { id: 'orders', name: 'Đơn hàng', value: 0, icon: 'fa-solid fa-cart-shopping' },
    { id: 'revenue', name: 'Doanh thu', value: 0, icon: 'fa-solid fa-sack-dollar' },
    { id: 'campaigns', name: 'Chiến dịch', value: 0, icon: 'fa-solid fa-bullhorn' },
  ];

  readonly period = signal('7d');
  readonly dateRange = signal<Date[] | null>(null);
  // Clear trong ng-select trả `null` / `[]` → hiện tất cả.
  readonly statIds = signal<string[] | null>(this.stats.map((s) => s.id));
  readonly visibleStats = computed(() => {
    const ids = this.statIds();
    return ids?.length ? this.stats.filter((s) => ids.includes(s.id)) : this.stats;
  });
}
