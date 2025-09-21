import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-chatbot-header',
  template: `
  <div class="bg-gray-700 p-4 border-b border-gray-600 flex items-center justify-between">
      <div class="w-8"></div> <!-- Left spacer to balance button -->
      <h1 class="text-xl font-bold text-white text-center flex-grow">AI Assistant</h1>
      <button
        (click)="clearChatClicked.emit()"
        [disabled]="!canClearChat()"
        class="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Clear chat history">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `,
  styleUrls: ['../../ui/tailwind-utilities.css', '../chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotHeaderComponent {
  hasMessages = input(false);
  isLoading = input(false);

  clearChatClicked = output();
  canClearChat = computed(() => this.hasMessages() && !this.isLoading());
}
