import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.995 8.995 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.707 12.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414-1.414L4.707 12.293zm7-7a1 1 0 00-1.414-1.414l-3 3a1 1 0 101.414 1.414l3-3z" clip-rule="evenodd" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatIconComponent {}
