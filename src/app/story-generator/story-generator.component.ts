import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
import { ParserService } from '../gemini/services/parser.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { StoryService } from './services/story.service';
import { StoryGenerateMenuBarComponent } from './story-generate-menu-bar/story-generate-menu-bar.component';
import { StoryLength } from './types/story-length';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  imports: [LoaderComponent, PromptHistoryComponent, StoryGenerateMenuBarComponent],
  styleUrl: '../shared/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryGeneratorComponent {
  private readonly storyService = inject(StoryService);
  private readonly parserService = inject(ParserService);
  private readonly renderer = inject(Renderer2);

  promptHistory = this.storyService.promptHistory;

  prompt = signal('A knight who is afraid of the dark.');
  storyLength = signal<StoryLength>('short');
  genre = signal('fantasy');
  story = signal('');
  isLoading = signal(false);
  error = signal('');

  storyHolder = viewChild<ElementRef<HTMLDivElement>>('storyHolder');
  storyHolderElement = computed(() => this.storyHolder()?.nativeElement);

  readonly storyLengthOptions = this.storyService.getStoryLengthOptions();
  readonly genreOptions = this.storyService.getGenreOptions();

  isGenerationDisabled = computed(() => !this.prompt().trim() || this.isLoading());

  constructor() {
    effect(() => {
      console.log('Effect callback of the story generator is run.');
      const element = this.storyHolderElement();
      if (element && !this.parserService.hasParser()) {
        this.parserService.initParser(element);
      }
    });

    afterRenderEffect({
      write: () => {
        const value = this.story();
        if (value) {
          this.parserService.writeToElement(value);
        }
      }
    });
  }

  async generateStory(): Promise<void> {
    if (this.isGenerationDisabled()) {
      return;
    }

    this.clearStory();
    this.error.set('');
    const trimmedPrompt = this.prompt().trim();

    // Update prompt signal if it contained whitespace
    if (this.prompt() !== trimmedPrompt) {
      this.prompt.set(trimmedPrompt);
    }

    try {
      const params = {
        prompt: this.prompt(),
        lengthDescription: this.storyLength(),
        genre: this.genre()
      };
      await this.storyService.generateStory(params, this.story, this.isLoading);
      this.parserService.resetParser();
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Failed to generate story. Please try again.');
      console.error(e);
    }
  }

  clearHistory(): void {
    this.storyService.clearHistory();
  }

  private clearStory() {
    const element = this.storyHolderElement();
    if (element?.lastChild) {
      this.renderer.setProperty(element, 'innerHTML', '');
    }
  }
}
