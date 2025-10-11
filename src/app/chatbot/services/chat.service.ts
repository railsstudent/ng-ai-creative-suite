import { inject, Injectable, signal } from '@angular/core';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { GeminiService } from '../../gemini/services/gemini.service';
import { PromptFormService } from '../../shared/services/prompt-form.service';
import { INITIAL_BOT_MESSAGE } from '../constants/chat.const';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService  {
  private readonly geminiService = inject(GeminiService);
  private readonly promptFormService = inject(PromptFormService);

  isLoading = this.promptFormService.isLoading;

  #messages = signal([INITIAL_BOT_MESSAGE]);
  messages = this.#messages.asReadonly();

  #message = signal('');

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

    const newId = this.#messages().length;

    try {
      // Get bot response
      const botStream = await this.geminiService.sendChatMessageStream(userMessage);

      this.isLoading.set(false);

      for await (const chunk of botStream) {
        const chunkText = chunk.candidates?.[0].content?.parts?.[0].text || '';
        DOMPurify.sanitize(this.#message() + chunkText);
        if (DOMPurify.removed.length) {
          throw new Error('Received unsafe content. Aborting.');
        }

        this.#message.update((prev) => prev + chunkText);
      }

      const parsedMarkdown = await marked.parse(this.#message());
      this.#messages.set([...this.#messages(), { id: newId, sender: 'bot', text: parsedMarkdown }]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Sorry, I encountered an error. Please try again.';
      this.#messages.set([...this.#messages(), { id: newId, sender: 'bot', text: errorMessage }]);
    } finally {
      this.isLoading.set(false);
      this.#message.set('');
    }
  }

  clearChat(): void {
    this.#messages.set([INITIAL_BOT_MESSAGE]);
  }
}
