import { inject, Injectable } from '@angular/core';
import { GenerateVideosConfig } from '@google/genai';
import { GeminiService } from '../../gemini/services/gemini.service';
import { GeneratedData } from '../../gemini/types/generated-image.type';
import { PromptFormService } from '../../ui/services/prompt-form.service';
import { PromptHistoryService } from '../../ui/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly promptFormService = inject(PromptFormService);

  private readonly historyKey = 'video';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();
  readonly isLoading = this.promptFormService.isLoading;
  readonly isGenerationDisabled = this.promptFormService.isGenerationDisabled;
  readonly prompt = this.promptFormService.prompt;
  readonly error = this.promptFormService.error;

  async generateVideosFromPrompt(config: GenerateVideosConfig): Promise<GeneratedData[]> {

    this.isLoading.set(true);
    this.error.set('');

    this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

    try {
      const results = await this.geminiService.generateVideos(this.prompt(), config);
      if (results.length === 0) {
        this.error.set('Failed to generate videos. The prompt may have been blocked by safety filters.');
        return [];
      }

      return results.map((url, id) => ({ id, url }));
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
      console.error(e);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
