import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptFormComponent } from '../../ui/prompt-form/prompt-form.component';

@Component({
  selector: 'app-video-menu-bar',
  imports: [FormsModule, PromptFormComponent],
  templateUrl: './video-menu-bar.component.html',
  styleUrl: '../../ui/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoMenuBarComponent {
  // Two-way bound signals from parent
  prompt = model.required<string>();
  numberOfVideos = model<number>();
  aspectRatio = model<string>();
  // resolution = model<string>();

  // Input options are now defined here
  readonly imageCountOptions = [1, 2, 3, 4];
  readonly aspectRatioOptions = ["16:9"];
  readonly resolutionOptions = ["720p"];

  // Event emitters
  generateVideo = output<void>();
}
