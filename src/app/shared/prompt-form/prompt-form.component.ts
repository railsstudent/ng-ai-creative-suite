import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [FormsModule, SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  prompt = model.required<string>();
  placeholderText = input('e.g., A detective who can talk to plants.');

  isLoading = input<boolean>(false);

  trimmedPrompt = computed(() => this.prompt()?.trim() || '');
  isGenerationDisabled = computed(() => !this.trimmedPrompt() || this.isLoading());

  generate = output<{ prompt: string, isGenerationDisabled: boolean }>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit({
        prompt: this.trimmedPrompt(),
        isGenerationDisabled: this.isGenerationDisabled(),
      });
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
