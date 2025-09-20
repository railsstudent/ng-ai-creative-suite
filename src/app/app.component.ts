import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  template: `
<div class="flex flex-col h-screen">
<!--
<app-navigation />
-->

  <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
    <router-outlet />
  </main>
</div>`,
  imports: [
    RouterOutlet,
    // NavigationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
