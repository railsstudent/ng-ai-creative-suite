import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { ChatMessage } from '../types/chat-message.type';

@Component({
  selector: 'app-chatbot-messages',
  templateUrl: './chatbot-messages.component.html',
  styleUrls: ['../../shared/tailwind-utilities.css', '../chatbot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotMessagesComponent {
  messages = input<ChatMessage[]>([]);
  isLoading = input(false);

  chatContainer = viewChild.required<ElementRef<HTMLDivElement>>('chatContainer');
  private nativeElement = computed(() => this.chatContainer().nativeElement);

  hostElement = inject(ElementRef);

  scrollToTop() {
    this.nativeElement().scrollTop = this.nativeElement().scrollHeight;
  }
}
