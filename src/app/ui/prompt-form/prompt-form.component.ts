import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../../icons/spinner-icon.component';
import { UIStateService } from '../services/ui-state.service';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [FormsModule, SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  readonly uiService = inject(UIStateService);

  prompt = model.required<string>();

  isLoading = this.uiService.isLoading;
  isGenerationDisabled = this.uiService.isGenerationDisabled;

  generate = output<void>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit();
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    // Submit on Enter, allow new line with Shift+Enter
    if (event.key === 'Enter') {
        event.preventDefault();
        this.onGenerateClick();
    }
  }
}
