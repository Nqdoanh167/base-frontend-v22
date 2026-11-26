import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';

// Page tự đặt `<app-main-header>` đầu trang: `.left` (tiêu đề / tab), `.right` (nút thao tác).
@Component({
  selector: 'app-main-header',
  imports: [RouterLink],
  templateUrl: './main-header.html',
  styleUrl: './main-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class MainHeader {
  private readonly auth = inject(AuthService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly user = this.auth.user;
  readonly biz = this.auth.biz;
  readonly isAdmin = this.auth.isAdmin;
  readonly userInitial = computed(() => this.user()?.name?.charAt(0).toUpperCase() || '?');
  readonly profileUrl = `${environment.urlDomain}/user`;
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
