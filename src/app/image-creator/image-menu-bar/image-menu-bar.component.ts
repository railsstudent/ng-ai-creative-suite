import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../../icons/spinner-icon.component';
import { PromptFormComponent } from '../../ui/prompt-form/prompt-form.component';

@Component({
  selector: 'app-image-menu-bar',
  templateUrl: './image-menu-bar.component.html',
  imports: [FormsModule, SpinnerIconComponent, PromptFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageMenuBarComponent {
  // Two-way bound signals from parent
  prompt = model.required<string>();
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
  generateImage = output<void>();
  generateVideo = output<void>();
}
