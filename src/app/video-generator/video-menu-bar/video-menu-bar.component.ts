import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptFormComponent } from '../../shared/prompt-form/prompt-form.component';
import { GeneratePrompt } from '../../shared/types/generate-prompt.type';

@Component({
  selector: 'app-video-menu-bar',
  imports: [FormsModule, PromptFormComponent],
  templateUrl: './video-menu-bar.component.html',
  styleUrl: '../../shared/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoMenuBarComponent {
  // Two-way bound signals from parent
  prompt = model.required<string>();
  isLoading = input.required<boolean>();

  numberOfVideos = model<number>();
  aspectRatio = model<string>();
  resolution = model<string>();

  // Input options are now defined here
  readonly videoCountOptions = [1, 2, 3, 4];
  readonly aspectRatioOptions = ["16:9"];
  readonly resolutionOptions = ["720p", "1080p"];

  // Event emitters
  generateVideo = output<GeneratePrompt>();
}
