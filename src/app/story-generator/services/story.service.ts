import { inject, Injectable, WritableSignal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { StoryOption } from '../types/story-option';
import { StoryParams } from '../types/story-param';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);

  private readonly historyKey = 'story';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();

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

  async generateStory({ prompt, lengthDescription: length, genre }: StoryParams, chunkSignal: WritableSignal<string>,
    loaderSignal: WritableSignal<boolean>): Promise<void> {

    // The service now handles trimming and empty checks for history
    this.promptHistoryService.addPrompt(this.historyKey, prompt);

    const lengthInstruction = {
      short: 'a short (around 150 words)',
      medium: 'a medium-length (around 300 words)',
      long: 'a long (around 500 words)',
    }[length];

    const fullPrompt = `Write ${lengthInstruction} creative ${genre} story based on the following prompt: "${prompt}"`;

    await this.geminiService.generateTextStream(fullPrompt, chunkSignal, loaderSignal);
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
