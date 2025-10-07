import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAX_CHARACTER_COUNT } from '../constants/chat.const';
import { ChatBotService } from '../services/chat.service';

@Component({
  selector: 'app-chatbot-input',
  imports: [FormsModule],
  templateUrl: './chatbot-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotInputComponent {
  private readonly chatbotService = inject(ChatBotService);

  readonly maxLength = MAX_CHARACTER_COUNT;

  currentMessage = signal('');
  charCountDisplay = computed(() => `${this.currentMessage().length} / ${this.maxLength}`);
  trimmedMessage = computed(() => this.currentMessage().trim());

  isLoading = this.chatbotService.isLoading;

  sendMessageClicked = output<string>();
}
