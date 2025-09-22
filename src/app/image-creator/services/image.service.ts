import { DOCUMENT, inject, Injectable } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { GeneratedBase64Image } from '../../gemini/types/generated-image.type';
import { PromptFormService } from '../../ui/services/prompt-form.service';
import { PromptHistoryService } from '../../ui/services/prompt-history.service';
import { ImageParams } from '../types/image-params.type';
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

  async generateImages({ numImages, aspectRatio }: ImageParams): Promise<GeneratedBase64Image[]> {

    this.isLoading.set(true);
    this.error.set('');

    this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

    try {
      const result = await this.geminiService.generateImages(this.prompt(), numImages, aspectRatio);
      if (result.length === 0) {
        this.error.set('Failed to generate image. The prompt may have been blocked by safety filters.');
        return [];
      }

      return result;
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
}
