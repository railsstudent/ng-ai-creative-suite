import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../ui/confirmation-dialog/confirmation-dialog.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { PromptHistoryComponent } from '../ui/prompt-history/prompt-history.component';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { ImageGridComponent } from './image-grid/image-grid.component';
import { ImageMenuBarComponent } from './image-menu-bar/image-menu-bar.component';
import { ImageService } from './services/image.service';
import { ImageDownloadEvent } from './types/image.type';

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
  private document = inject(DOCUMENT);
  private imageService = inject(ImageService);

  imageUrls = signal<{ id: number; url: string }[]>([]);

  promptHistory = this.imageService.promptHistory;
  prompt = this.imageService.prompt;
  isLoading = this.imageService.isLoading;
  error = this.imageService.error;
  isGenerationDisabled = this.imageService.isGenerationDisabled;

  numberOfImages = signal(1);
  aspectRatio = signal('1:1');

  // Video generation state
  enableVideoGeneration = signal(true);
  selectedImageId = signal<number | null>(null);

  videoPlayer = viewChild(VideoPlayerComponent);

  // New state for confirmation dialog
  showDownloadConfirmation = signal(false);
  imageToDownload = signal<ImageDownloadEvent | null>(null);

  selectedImage = computed(() => {
    const id = this.selectedImageId();
    if (id === null) {
      return null;
    }
    return this.imageUrls().find(img => img.id === id) ?? null;
  });

  constructor() {
    this.prompt.set('A photorealistic image of a cat wearing a tiny wizard hat.');
  }

  async generateImage(): Promise<void> {
    if (this.isGenerationDisabled()) {
      return;
    }

    this.imageUrls.set([]);
    this.selectedImageId.set(null);

    const trimmedPrompt = this.prompt().trim();
    if (this.prompt() !== trimmedPrompt) {
        this.prompt.set(trimmedPrompt);
    }

    const result = await this.imageService.generateImages(
      { numImages: this.numberOfImages(), aspectRatio: this.aspectRatio() }
    );
    this.imageUrls.set(result);
  }

  selectImage(id: number): void {
    this.selectedImageId.update(currentId => currentId === id ? null : id);
  }

  downloadImage(image: ImageDownloadEvent): void {
    this.imageToDownload.set(image);
    this.showDownloadConfirmation.set(true);
  }

  confirmDownload(): void {
    const image = this.imageToDownload();
    if (!image) {
      return;
    }

    this.imageService.downloadImage(image);
    this.cancelDownload();
  }

  cancelDownload(): void {
    this.showDownloadConfirmation.set(false);
    this.imageToDownload.set(null);
  }

  onGenerateVideo(): void {
    this.videoPlayer()?.generateVideo();
  }

  clearHistory(): void {
    this.imageService.clearHistory();
  }
}
