import { DOCUMENT, inject, Injectable } from '@angular/core';
import { GenerateImagesConfig } from '@google/genai';
import { GeminiService } from '../../gemini/services/gemini.service';
import { GeneratedData } from '../../gemini/types/generated-image.type';
import { PromptFormService } from '../../shared/services/prompt-form.service';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';
import { ImageDownloadEvent } from '../types/image.type';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly promptFormService = inject(PromptFormService);
  private readonly document = inject(DOCUMENT);

  private readonly historyKey = 'image';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();
  readonly isLoading = this.promptFormService.isLoading;
  readonly isGenerationDisabled = this.promptFormService.isGenerationDisabled;
  readonly prompt = this.promptFormService.prompt;
  readonly error = this.promptFormService.error;

  async generateImages(config: GenerateImagesConfig): Promise<GeneratedData[]> {

    this.isLoading.set(true);
    this.error.set('');

    this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

    try {
      const results = await this.geminiService.generateImages(this.prompt(), config);
      if (results.length === 0) {
        this.error.set('Failed to generate images. The prompt may have been blocked by safety filters.');
        return [];
      }

      return results;
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

  downloadImage({ imageUrl, index }: ImageDownloadEvent) {
    const link = this.document.createElement('a');
    link.href = imageUrl;

    // Create a filename from the prompt
    const promptText = this.prompt() || 'generated-image';
    const safeFilename = promptText.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);

    link.download = `${safeFilename}_${index + 1}.png`;
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }

  async regenerateImage(config: GenerateImagesConfig): Promise<GeneratedData | undefined> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      const results = await this.geminiService.generateImages(this.prompt(), config);
      if (results.length === 0) {
        this.error.set('Failed to generate images. The prompt may have been blocked by safety filters.');
        return undefined;
      }

      return results[0];
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
      console.error(e);
      return undefined;
    } finally {
      this.isLoading.set(false);
    }
  }
}
