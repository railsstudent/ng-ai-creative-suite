import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-download-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadIconComponent {}

@Component({
  selector: 'app-regenerate-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4 9a6 6 0 1111.657 2.37.75.75 0 01-1.247-.81A4.5 4.5 0 106.5 11a.75.75 0 110-1.5h3.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-1.046a6 6 0 01-4-3.204z" clip-rule="evenodd"/>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegenerateIconComponent {}
