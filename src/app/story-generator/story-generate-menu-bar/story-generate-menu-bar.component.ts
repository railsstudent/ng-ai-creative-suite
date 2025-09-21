import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptFormComponent } from '../../ui/prompt-form/prompt-form.component';
import { StoryOption } from '../types/story-option';

@Component({
  selector: 'app-story-generate-menu-bar',
  templateUrl: './story-generate-menu-bar.component.html',
  styleUrl: '../../ui/tailwind-utilities.css',
  imports: [FormsModule, PromptFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryGenerateMenuBarComponent {
  // Two-way bound signals from parent
  prompt = model.required<string>();
  storyLength = model.required<string>();
  genre = model.required<string>();

  // Input options for dropdowns
  storyLengthOptions = input.required<StoryOption[]>();
  genreOptions = input.required<StoryOption[]>();

  // Event emitter for generating the story
  generateStory = output<void>();
}
