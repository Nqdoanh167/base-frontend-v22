import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
// Web component `<appvn-logo>` (Lit, của SMAX): logo + đổi biz / module, tự đọc `smaxapp_token`.
import 'appvn/appvn-logo';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  /** Path router (sau base href `/{alias}/crm/`). */
  route: string;
}

const SIDEBAR_MENU: MenuItem[] = [{ id: 'home', label: 'Trang chủ', icon: 'fa-solid fa-house', route: 'home' }];

@Component({
  selector: 'app-main-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-sidebar.html',
  styleUrl: './main-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { '[class.collapsed]': 'collapsed()' },
})
export class MainSidebar {
  readonly collapsed = model(false);

  readonly menu = SIDEBAR_MENU;
  readonly biz = inject(AuthService).biz;
}
