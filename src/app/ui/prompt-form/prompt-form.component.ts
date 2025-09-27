import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';
import { PromptFormService } from '../services/prompt-form.service';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [FormsModule, SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  readonly uiService = inject(PromptFormService);

  prompt = model.required<string>();
  placeholderText = input('e.g., A detective who can talk to plants.');

  isLoading = this.uiService.isLoading;
  isGenerationDisabled = this.uiService.isGenerationDisabled;

  generate = output<void>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit();
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
