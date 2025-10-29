import { inject, Injectable, signal } from '@angular/core';
import { GenerateVideosConfig } from '@google/genai';
import { GeminiService } from '../../gemini/services/gemini.service';
import { GeneratedData } from '../../gemini/types/generated-image.type';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);

  private readonly historyKey = 'video';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();

  readonly isLoading = signal(false);
  readonly prompt = signal('');
  readonly error = signal('');

  videoError = signal('');
  isGeneratingVideo = signal(false);

  async generateVideosFromPrompt(prompt: string, config: GenerateVideosConfig): Promise<GeneratedData[]> {
    return this.generateVideosFromImage(prompt, config, true)
  }

  async generateVideosFromImage(
    prompt: string,
    config: GenerateVideosConfig,
    shouldBlockPrompting: boolean,
    imageBytes: string | undefined = undefined
  ): Promise<GeneratedData[]> {
    this.isGeneratingVideo.set(true);
    this.videoError.set('');
    this.isLoading.set(shouldBlockPrompting);

    this.promptHistoryService.addPrompt(this.historyKey, prompt);

    try {
      const results = await this.geminiService.generateVideos(prompt, config, imageBytes);
      if (results.length === 0) {
        this.videoError.set('Failed to generate videos. The prompt may have been blocked by safety filters.');
        return [];
      }

      return results.map((url, id) => ({ id, url }));
    } catch (e: unknown) {
      this.videoError.set(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
      console.error(e);
      return [];
    } finally {
      this.isGeneratingVideo.set(false);
      this.isLoading.set(false);
    }
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
