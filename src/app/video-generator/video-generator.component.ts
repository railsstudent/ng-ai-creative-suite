import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GeneratedData } from '../gemini/types/generated-image.type';
import { ContainerComponent } from '../shared/container/container.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { LoaderComponent } from '../shared/loader/loader.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { VideoService } from './services/video.service';
import { VideoGridComponent } from "./video-grid/video-grid.component";
import { VideoMenuBarComponent } from './video-menu-bar/video-menu-bar.component';

@Component({
  selector: 'app-video-generator',
  templateUrl: './video-generator.component.html',
  imports: [
    ErrorDisplayComponent,
    VideoMenuBarComponent,
    PromptHistoryComponent,
    VideoGridComponent,
    LoaderComponent,
    ContainerComponent,
],
  styleUrl: '../shared/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VideoGeneratorComponent {
  private videoService = inject(VideoService);

  videoUrls = signal<GeneratedData[]>([]);

  prompt = this.videoService.prompt;
  promptHistory = this.videoService.promptHistory;
  isGenerationDisabled = this.videoService.isGenerationDisabled;
  isLoading = this.videoService.isGeneratingVideo;
  error = this.videoService.videoError;

  numberOfVideos = signal(1);
  aspectRatio = signal('16:9');

  constructor() {
    this.prompt.set('A cinematic shot of a majestic lion in the savannah at sunset.');
  }

  async generateVideos(): Promise<void> {
    if (this.isGenerationDisabled()) {
      return;
    }

    const trimmedPrompt = this.prompt().trim();
    if (this.prompt() !== trimmedPrompt) {
      this.prompt.set(trimmedPrompt);
    }

    const videos = await this.videoService.generateVideosFromPrompt({
      numberOfVideos: this.numberOfVideos(),
      aspectRatio: this.aspectRatio(),
    });

    this.videoUrls.set(videos);
  }

  clearHistory(): void {
    this.videoService.clearHistory();
  }
}
