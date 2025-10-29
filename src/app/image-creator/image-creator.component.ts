import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeneratedData } from '../gemini/types/generated-image.type';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { ContainerComponent } from '../shared/container/container.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { LoaderComponent } from '../shared/loader/loader.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { VideoService } from '../video-generator/services/video.service';
import { VideoPlayerComponent } from '../video-generator/video-player/video-player.component';
import { ImageGridComponent } from './image-grid/image-grid.component';
import { ImageMenuBarComponent } from './image-menu-bar/image-menu-bar.component';
import { ImageConfirmationService } from './services/confirmation.service';
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
    ContainerComponent
  ],
  styleUrls: ['../shared/tailwind-utilities.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageCreatorComponent {
  private imageService = inject(ImageService);
  private videoService = inject(VideoService);
  private confirmationService = inject(ImageConfirmationService);

  promptHistory = this.imageService.promptHistory;
  prompt = this.imageService.prompt;
  isLoading = this.imageService.isLoading;
  error = this.imageService.error;

  imageUrls = signal<GeneratedData[]>([]);
  numberOfImages = signal(1);
  aspectRatio = signal('1:1');

  // Video generation state
  enableVideoGeneration = signal(true);
  selectedImageId = this.confirmationService.selectedImageId;

  // New state for confirmation dialog
  imageToRegenerate = this.confirmationService.imageToRegenerate;
  imageToDownload = this.confirmationService.imageToDownload;
  showConfirmation = this.confirmationService.showConfirmation;

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

  async generateImage({ prompt, isGenerationDisabled }:
    { prompt: string, isGenerationDisabled: boolean }
  ): Promise<void> {
    if (isGenerationDisabled) {
      return;
    }

    this.imageUrls.set([]);
    this.confirmationService.resetImage();

    const images = await this.imageService.generateImages(
      prompt,
      { numberOfImages: this.numberOfImages(), aspectRatio: this.aspectRatio() }
    );

    this.imageUrls.set(images);
  }

  selectImage(id: number): void {
    this.confirmationService.selectImage(id);
  }

  downloadImage(image: ImageDownloadEvent): void {
    this.confirmationService.setDownloadImage(image);
  }

  async doConfirm() {
    const imageOrUndefined = await this.confirmationService.doConfirm(this.aspectRatio());
    if (imageOrUndefined) {
      this.imageUrls.update((images) =>
        images.map((image) =>
          image.id === imageOrUndefined.id ? imageOrUndefined : image
        )
      );
    }
  }

  doCancel() {
    this.confirmationService.doCancel();
  }

  regenerateImage(id: number): void {
    this.confirmationService.setRegenerateImage(id);
  }

  async generateVideo(
    { prompt, isGenerateVideoDisabled }: { prompt: string, isGenerateVideoDisabled: boolean }
  ): Promise<void> {
    if (isGenerateVideoDisabled) {
      return;
    }

    const image = this.selectedImage();
    if (!image || !image.url.split(',')?.[1]) {
      this.error.set('Could not extract base64 data from image URL.');
      return;
    }

    this.videoError.set('');
    this.videoUrl.set('');
    const imageBytes = image.url.split(',')[1];
    const videos = await this.videoService.generateVideosFromImage(
        prompt,
      {
        numberOfVideos: 1,
        aspectRatio: '16:9',
        // resolution: '1080p',
      },
      false,
      imageBytes
    );

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
