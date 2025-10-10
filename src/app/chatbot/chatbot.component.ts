import { ChangeDetectionStrategy, Component, effect, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotHeaderComponent } from './chatbot-header/chatbot-header.component';
import { ChatbotInputComponent } from './chatbot-input/chatbot-input.component';
import { ChatbotMessagesComponent } from './chatbot-messages/chatbot-messages.component';
import { ChatBotService } from './services/chat.service';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule, ChatbotInputComponent, ChatbotHeaderComponent, ChatbotMessagesComponent],
  template: `
<div class="flex flex-col h-full container">
  <div class="flex-grow flex flex-col bg-gray-800 rounded-t-lg shadow-xl overflow-hidden">
    <app-chatbot-header [isLoading]="isLoading()" [hasMessages]="messages().length > 1"
      (clearChatClicked)="clearChat()"
    />
    <app-chatbot-messages #messagesContainer
      class="flex-1 p-4 space-y-4 overflow-y-auto"
      [messages]="messages()" [isLoading]="isLoading()"
    />
    <app-chatbot-input (sendMessageClicked)="sendMessage($event)" />
  </div>
</div>
`,
  styleUrls: ['../shared/tailwind-utilities.css', './chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatbotComponent {
  private readonly chatbotService = inject(ChatBotService);

  isLoading = this.chatbotService.isLoading;
  messages = this.chatbotService.messages;

  chatContainer = viewChild.required<ChatbotMessagesComponent>('messagesContainer');

  constructor() {
    effect(() => {
      if (this.messages().length > 1) {
        this.chatContainer().scrollToTop();
      }
    });
  }

  async sendMessage(userMessage: string): Promise<void> {
    this.chatbotService.sendMessage(userMessage);
  }

  clearChat(): void {
    this.chatbotService.clearChat();
  }
}
