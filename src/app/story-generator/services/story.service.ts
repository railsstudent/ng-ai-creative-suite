import { inject, Injectable, WritableSignal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { ParserService } from '../../shared/services/parser.service';
import { PromptFormService } from '../../shared/services/prompt-form.service';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';
import { StoryOption } from '../types/story-option';
import { StoryParams } from '../types/story-params';
import storyConfig from '../story-commands.json';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly promptFormService = inject(PromptFormService);
  private readonly parserService = inject(ParserService);

  private readonly historyKey = 'story';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();
  readonly isLoading = this.promptFormService.isLoading;
  readonly isGenerationDisabled = this.promptFormService.isGenerationDisabled;
  readonly prompt = this.promptFormService.prompt;
  readonly error = this.promptFormService.error;

  getStoryLengthOptions(): StoryOption[] {
    return storyConfig.length;
  }

  getGenreOptions(): StoryOption[] {
    return storyConfig.genre.sort((a, b) => a.value.localeCompare(b.value));
  }

  async generateStory(
    { length, genre }: StoryParams,
    chunkSignal: WritableSignal<string>,
  ): Promise<void> {

    try {
      this.isLoading.set(true);
      this.error.set('');

      // The service now handles trimming and empty checks for history
      this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

      const lengthInstruction = {
        short: 'a short (around 300 words)',
        medium: 'a medium-length (around 450 words)',
        long: 'a long (around 600 words)',
      }[length];

      const fullPrompt = `Write ${lengthInstruction} creative ${genre} story based on the following prompt: "${this.prompt()}"`;
      const stream = await this.geminiService.generateTextStream(fullPrompt);
      this.isLoading.set(false);

      for await (const chunk of stream) {
        const chunkText = chunk.candidates?.[0].content?.parts?.[0].text || '';
        const markdownText = chunkText.replace(/\n\n/g, '<br><br>')
        chunkSignal.set(markdownText);
      }
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Failed to generate story. Please try again.');
      console.error(e);
    } finally {
      this.parserService.flushAll();
      this.isLoading.set(false);
    }
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
