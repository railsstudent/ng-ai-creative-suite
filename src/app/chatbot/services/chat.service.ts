import { inject, Injectable, signal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { UIStateService } from '../../ui/services/ui-state.service';
import { INITIAL_BOT_MESSAGE } from '../constants/chat.const';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService  {
  private readonly geminiService = inject(GeminiService);
  private readonly uiStateService = inject(UIStateService);

  isLoading = this.uiStateService.isLoading;
  #messages = signal([INITIAL_BOT_MESSAGE]);

  messages = this.#messages.asReadonly();

  async sendMessage(userMessage: string): Promise<void> {
    if (!userMessage || this.isLoading()) {
      return;
    }

    // Add user message to chat
    this.#messages.update(msgs => {
      const newId = msgs.length;
      return [...msgs, { id: newId, sender: 'user', text: userMessage }];
    });
    this.isLoading.set(true);

    try {
      // Get bot response
      const botResponse = await this.geminiService.sendChatMessage(userMessage);
      this.#messages.update(msgs => {
        const newId = msgs.length;
        return [...msgs, { id: newId, sender: 'bot', text: botResponse }];
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Sorry, I encountered an error. Please try again.';
      this.#messages.update(msgs => {
        const newId = msgs.length;
        return [...msgs, { id: newId, sender: 'bot', text: errorMessage }];
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  clearChat(): void {
    this.#messages.set([INITIAL_BOT_MESSAGE]);
  }
}
