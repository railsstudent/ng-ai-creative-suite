import { inject, Injectable, WritableSignal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { ParserService } from '../../ui/services/parser.service';
import { PromptHistoryService } from '../../ui/services/prompt-history.service';
import { UIStateService } from '../../ui/services/ui-state.service';
import { StoryOption } from '../types/story-option';
import { StoryParams } from '../types/story-params';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly uiStateService = inject(UIStateService);
  private readonly parserService = inject(ParserService);

  private readonly historyKey = 'story';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();
  readonly isLoading = this.uiStateService.isLoading;
  readonly isGenerationDisabled = this.uiStateService.isGenerationDisabled;
  readonly prompt = this.uiStateService.prompt;
  readonly error = this.uiStateService.error;

  getStoryLengthOptions(): StoryOption[] {
    return [
      { value: 'short', label: 'Short' },
      { value: 'medium', label: 'Medium' },
      { value: 'long', label: 'Long' },
    ];
  }

  getGenreOptions(): StoryOption[] {
    return [
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'action', label: 'Action' },
      { value: 'sci-fi', label: 'Sci-Fi' },
      { value: 'mystery', label: 'Mystery' },
      { value: 'romance', label: 'Romance' },
      { value: 'horror', label: 'Horror' },
      { value: 'comedy', label: 'Comedy' },
      { value: 'adventure', label: 'Adventure' },
    ];
  }

  async generateStory({ lengthDescription: length, genre }: StoryParams, chunkSignal: WritableSignal<string>): Promise<void> {

    try {
      this.isLoading.set(true);
      this.error.set('');

      // The service now handles trimming and empty checks for history
      this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

      const lengthInstruction = {
        short: 'a short (around 150 words)',
        medium: 'a medium-length (around 300 words)',
        long: 'a long (around 500 words)',
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
      this.parserService.resetParser();
      this.isLoading.set(false);
    }
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
