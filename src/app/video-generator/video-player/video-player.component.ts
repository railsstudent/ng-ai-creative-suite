import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { LoaderComponent } from '../../ui/loader/loader.component';
import { Image } from '../../image-creator/types/image.type';

@Component({
  selector: 'app-video-player',
  imports: [LoaderComponent],
  templateUrl: './video-player.component.html',
  styleUrl: '../../ui/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  private geminiService = inject(GeminiService);

  prompt = input('');
  selectedImage = input<Image | null>(null);
  isImageLoading = input(false);

  isGeneratingVideo = signal(false);
  videoUrl = input.required<string>();
  videoError = signal('');

  isGenerateVideoDisabled = computed(() => this.selectedImage() === null || this.isGeneratingVideo() || this.isImageLoading());

  // async generateVideo(): Promise<void> {
  //   if (this.isGeneratingVideo()) {
  //     return;
  //   }

  //   if (!this.prompt()) {
  //     this.videoError.set('A prompt is required to generate a video.');
  //     return;
  //   }

  //   this.isGeneratingVideo.set(true);
  //   this.videoUrl.set(null);
  //   this.videoError.set('');

  //   try {
  //     const image = this.selectedImage();
  //     if (!image) {
  //       throw new Error('Could not extract base64 data from image URL.');
  //     }
  //     const base64Data = image.url.split(',')[1];

  //     const result = await this.geminiService.generateVideos(this.prompt(),
  //       { numberOfVideos: 1, aspectRatio: '16:9', resolution: '720p' },
  //       base64Data
  //     );

  //     if (result) {
  //       this.videoUrl.set(result);
  //     } else {
  //       this.videoError.set('Video generation finished, but the final video could not be prepared.');
  //     }
  //   } catch (e: unknown) {
  //     this.videoError.set(e instanceof Error ? e.message : 'An unexpected error occurred while generating the video.');
  //     console.error(e);
  //   } finally {
  //     this.isGeneratingVideo.set(false);
  //   }
  // }
}
