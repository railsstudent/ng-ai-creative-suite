import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-container',
  template: `
    <div class="container">
      <h1 class="main-header"><ng-content [select]="header1" /></h1>
      <p class="main-header2"><ng-content [select]="header2" /></p>
      <ng-content />
    </div>
  `,
  styleUrl: '../tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {}
