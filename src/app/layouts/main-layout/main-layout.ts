import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainSidebar } from './components/main-sidebar/main-sidebar';

const COLLAPSED_KEY = 'sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MainSidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  readonly collapsed = signal(readCollapsed());

  constructor() {
    effect(() => {
      const collapsed = String(this.collapsed());
      try {
        localStorage.setItem(COLLAPSED_KEY, collapsed);
      } catch {
        // Không lưu được (private mode) → chỉ giữ trong phiên.
      }
    });
  }
}
