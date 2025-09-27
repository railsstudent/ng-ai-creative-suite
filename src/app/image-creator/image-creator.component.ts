import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeneratedData } from '../gemini/types/generated-image.type';
import { ConfirmationDialogComponent } from '../ui/confirmation-dialog/confirmation-dialog.component';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { PromptHistoryComponent } from '../ui/prompt-history/prompt-history.component';
import { VideoService } from '../video-generator/services/video.service';
import { VideoPlayerComponent } from '../video-generator/video-player/video-player.component';
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
    ErrorDisplayComponent,
  ],
  styleUrls: ['../ui/tailwind-utilities.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageCreatorComponent {
  private imageService = inject(ImageService);
  private videoService = inject(VideoService);

  promptHistory = this.imageService.promptHistory;
  prompt = this.imageService.prompt;
  isLoading = this.imageService.isLoading;
  error = this.imageService.error;
  isGenerationDisabled = this.imageService.isGenerationDisabled;

  imageUrls = signal<GeneratedData[]>([]);
  numberOfImages = signal(1);
  aspectRatio = signal('1:1');

  // Video generation state
  enableVideoGeneration = signal(true);
  selectedImageId = signal<number | null>(null);

  // New state for confirmation dialog
  showConfirmation = signal<'download' | 'regenerate' | 'none'>('none');
  imageToDownload = signal<ImageDownloadEvent | null>(null);
  imageToRegenerate = signal(-1);
  videoUrl = signal('');
  videoError = this.videoService.videoError;
  isGeneratingVideo = this.videoService.isGeneratingVideo;

  selectedImage = computed(() => {
    const id = this.selectedImageId();
    if (id === null) {
      return null;
    }
    return this.imageUrls().find(img => img.id === id) ?? null;
  });

  isGenerateVideoDisabled = computed(() =>
    this.selectedImage() === null || this.isGeneratingVideo() || this.isLoading()
  );

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

    const images = await this.imageService.generateImages(
      { numberOfImages: this.numberOfImages(), aspectRatio: this.aspectRatio() }
    );
    this.imageUrls.set(images);
  }

  selectImage(id: number): void {
    this.selectedImageId.update(currentId => currentId === id ? null : id);
  }

  downloadImage(image: ImageDownloadEvent): void {
    this.imageToDownload.set(image);
    this.showConfirmation.set('download');
  }

  async doConfirm() {
    if (this.showConfirmation() === 'download') {
      this.confirmDownload();
    } else if (this.showConfirmation() === 'regenerate') {
      await this.confirmRegenerate();
    }
  }

  doCancel() {
    if (this.showConfirmation() === 'download') {
      this.cancelDownload();
    } else if (this.showConfirmation() === 'regenerate') {
      this.cancelRegenerate();
    }
  }

  private confirmDownload(): void {
    const image = this.imageToDownload();
    if (!image) {
      return;
    }

    this.imageService.downloadImage(image);
    this.cancelDownload();
  }

  private cancelDownload(): void {
    this.showConfirmation.set('none');
    this.imageToDownload.set(null);
  }

  regenerateImage(index: number): void {
    this.imageToRegenerate.set(index);
    this.showConfirmation.set('regenerate');
  }

  private async confirmRegenerate() {
    if (this.imageToRegenerate() < 0) {
      return;
    }

    const index = this.imageToRegenerate();
    this.cancelRegenerate();

    const config = {
      numberOfImages: 1,
      aspectRatio: this.aspectRatio(),
    };
    const image = await this.imageService.regenerateImage(config);
    if (image) {
      this.imageUrls.update(
        (items) => items.map((item, i) => i == index ? image : item)
      );
    }
  }

  private cancelRegenerate(): void {
    this.showConfirmation.set('none');
    this.imageToRegenerate.set(-1);
  }

  async generateVideo(): Promise<void> {
    const image = this.selectedImage();
    if (!image || !image.url.split(',')?.[1]) {
      this.error.set('Could not extract base64 data from image URL.');
      return;
    }

    this.videoError.set('');
    this.videoUrl.set('');
    const imageBytes = image.url.split(',')[1];
    const videos = await this.videoService.generateVideosFromImage(
      {
        numberOfVideos: 1, aspectRatio: '16:9',
      }, imageBytes);

    if (!videos || videos.length === 0) {
      this.error.set('Video generation finished, but the final video could not be prepared.');
    } else {
      this.videoUrl.set(videos[0].url);
    }
  }

  clearHistory(): void {
    this.imageService.clearHistory();
  }
}
