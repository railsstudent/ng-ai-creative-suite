import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../gemini/services/gemini.service';
import { ConfirmationDialogComponent } from '../ui/confirmation-dialog/confirmation-dialog.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { PromptHistoryComponent } from '../ui/prompt-history/prompt-history.component';
import { PromptHistoryService } from '../ui/services/prompt-history.service';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { ImageGridComponent } from './image-grid/image-grid.component';
import { ImageMenuBarComponent } from './image-menu-bar/image-menu-bar.component';

@Component({
  selector: 'app-image-creator',
  templateUrl: './image-creator.component.html',
  imports: [
    FormsModule,
    LoaderComponent,
    VideoPlayerComponent,
    ImageGridComponent,
    ImageMenuBarComponent,
    PromptHistoryComponent,
    ConfirmationDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageCreatorComponent {
  private geminiService = inject(GeminiService);
  private document = inject(DOCUMENT);
  private promptHistoryService = inject(PromptHistoryService);

  private readonly historyKey = 'image';
  promptHistory = this.promptHistoryService.getHistory(this.historyKey);

  prompt = signal('A photorealistic image of a cat wearing a tiny wizard hat.');
  imageUrls = signal<{ id: number; url: string }[]>([]);
  isLoading = signal(false);
  error = signal('');

  numberOfImages = signal(1);
  aspectRatio = signal('1:1');

  // Video generation state
  enableVideoGeneration = signal(true);
  selectedImageId = signal<number | null>(null);

  videoPlayer = viewChild(VideoPlayerComponent);

  // New state for confirmation dialog
  showDownloadConfirmation = signal(false);
  imageToDownload = signal<{ imageUrl: string; index: number } | null>(null);

  selectedImage = computed(() => {
    const id = this.selectedImageId();
    if (id === null) {
      return null;
    }
    return this.imageUrls().find(img => img.id === id) ?? null;
  });

  isGenerationDisabled = computed(() => !this.prompt().trim() || this.isLoading());

  async generateImage(): Promise<void> {
    if (this.isGenerationDisabled()) {
      return;
    }

    this.isLoading.set(true);
    this.imageUrls.set([]);
    this.error.set('');
    this.selectedImageId.set(null);

    this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

    const trimmedPrompt = this.prompt().trim();
    if (this.prompt() !== trimmedPrompt) {
        this.prompt.set(trimmedPrompt);
    }

    try {
      const result = await this.geminiService.generateImages(trimmedPrompt, this.numberOfImages(), this.aspectRatio());
      if (result.length === 0) {
        this.error.set('Failed to generate image. The prompt may have been blocked by safety filters.');
      } else {
        this.imageUrls.set(result);
      }
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectImage(id: number): void {
    this.selectedImageId.update(currentId => currentId === id ? null : id);
  }

  downloadImage(imageUrl: string, index: number): void {
    this.imageToDownload.set({ imageUrl, index });
    this.showDownloadConfirmation.set(true);
  }

  confirmDownload(): void {
    const image = this.imageToDownload();
    if (!image) return;

    const link = this.document.createElement('a');
    link.href = image.imageUrl;

    // Create a filename from the prompt
    const promptText = this.prompt() || 'generated-image';
    const safeFilename = promptText.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);

    link.download = `${safeFilename}_${image.index + 1}.png`;
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);

    this.cancelDownload();
  }

  cancelDownload(): void {
    this.showDownloadConfirmation.set(false);
    this.imageToDownload.set(null);
  }

  onGenerateVideo(): void {
    this.videoPlayer()?.generateVideo();
  }

  usePromptFromHistory(selectedPrompt: string): void {
    this.prompt.set(selectedPrompt);
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
