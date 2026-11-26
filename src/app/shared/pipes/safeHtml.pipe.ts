import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value?: string, type = 'html') {
    if (!value) {
      return '';
    }
    if (type === 'url')
      return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    if (type === 'html') return this.sanitizer.bypassSecurityTrustHtml(value);
    return value;
  }
}
