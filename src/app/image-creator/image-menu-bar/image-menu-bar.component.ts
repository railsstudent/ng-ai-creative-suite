import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../../shared/icons/spinner-icon.component';
import { PromptFormComponent } from '../../shared/prompt-form/prompt-form.component';
import { GeneratePrompt } from '../../shared/types/generate-prompt.type';
import { GenerateVideoPrompt } from '../types/generate-video-prompt.type';

@Component({
  selector: 'app-image-menu-bar',
  templateUrl: './image-menu-bar.component.html',
  imports: [FormsModule, SpinnerIconComponent, PromptFormComponent],
  styleUrl: '../../shared/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageMenuBarComponent {
  // Two-way bound signals from parent
  prompt = model.required<string>();
  isLoading = input.required<boolean>();
  numberOfImages = model<number>();
  aspectRatio = model<string>();
  enableVideoGeneration = model(true);

  // Input options are now defined here
  readonly imageCountOptions = [1, 2, 3, 4];
  readonly aspectRatioOptions = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  // Video generation button state
  isGeneratingVideo = input(false);
  isGenerateVideoDisabled = input(false);

  // Event emitters
  generateImage = output<GeneratePrompt>();
  generateVideo = output<GenerateVideoPrompt>();
}
