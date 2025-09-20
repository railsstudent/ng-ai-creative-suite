import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GeminiService } from '../gemini/services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { PromptHistoryService } from '../shared/services/prompt-history.service';
import { StoryGenerateMenuBarComponent } from './story-generate-menu-bar/story-generate-menu-bar.component';
import { GENRE_OPTIONS, STORY_LENGTH_OPTIONS } from './story-generation-options.const';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  imports: [LoaderComponent, PromptHistoryComponent, StoryGenerateMenuBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryGeneratorComponent {
  private geminiService = inject(GeminiService);
  private promptHistoryService = inject(PromptHistoryService);

  private readonly historyKey = 'story';
  promptHistory = this.promptHistoryService.getHistory(this.historyKey);

  prompt = signal('A knight who is afraid of the dark.');
  storyLength = signal<'short' | 'medium' | 'long'>('medium');
  genre = signal('fantasy');
  story = signal('');
  isLoading = signal(false);
  error = signal('');

  readonly storyLengthOptions = STORY_LENGTH_OPTIONS;
  readonly genreOptions = GENRE_OPTIONS;

  isGenerationDisabled = computed(() => !this.prompt().trim() || this.isLoading());

  async generateStory(): Promise<void> {
    if (this.isGenerationDisabled()) {
      return;
    }

    this.isLoading.set(true);
    this.story.set('');
    this.error.set('');

    // The service now handles trimming and empty checks for history
    this.promptHistoryService.addPrompt(this.historyKey, this.prompt());

    const trimmedPrompt = this.prompt().trim();

    // Update prompt signal if it contained whitespace
    if (this.prompt() !== trimmedPrompt) {
      this.prompt.set(trimmedPrompt);
    }

    try {
      const lengthInstruction = {
        short: 'a short (around 100 words)',
        medium: 'a medium-length (around 200 words)',
        long: 'a long (around 300 words)',
      }[this.storyLength()];

      const fullPrompt = `Write ${lengthInstruction} creative ${this.genre()} story based on the following prompt: "${trimmedPrompt}"`;
      const result = await this.geminiService.generateText(fullPrompt);
      this.story.set(result);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Failed to generate story. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  usePromptFromHistory(selectedPrompt: string): void {
    this.prompt.set(selectedPrompt);
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
