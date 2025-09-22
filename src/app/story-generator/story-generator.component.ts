import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
import { ParserService } from '../ui/services/parser.service';
import { LoaderComponent } from '../ui/loader/loader.component';
import { PromptHistoryComponent } from '../ui/prompt-history/prompt-history.component';
import { StoryService } from './services/story.service';
import { StoryGenerateMenuBarComponent } from './story-generate-menu-bar/story-generate-menu-bar.component';
import { StoryLength } from './types/story-length';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  imports: [
    ErrorDisplayComponent,
    LoaderComponent,
    PromptHistoryComponent,
    StoryGenerateMenuBarComponent
  ],
  styleUrl: '../ui/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryGeneratorComponent {
  private readonly storyService = inject(StoryService);
  private readonly parserService = inject(ParserService);
  private readonly renderer = inject(Renderer2);

  promptHistory = this.storyService.promptHistory;
  prompt = this.storyService.prompt;
  isLoading = this.storyService.isLoading;
  error = this.storyService.error;
  isGenerationDisabled = this.storyService.isGenerationDisabled;

  storyLength = signal<StoryLength>('short');
  genre = signal('fantasy');
  story = signal('');

  storyHolder = viewChild<ElementRef<HTMLDivElement>>('storyHolder');
  storyHolderElement = computed(() => this.storyHolder()?.nativeElement);

  readonly storyLengthOptions = this.storyService.getStoryLengthOptions();
  readonly genreOptions = this.storyService.getGenreOptions();

  constructor() {
    this.prompt.set('A knight who is afraid of the dark');
    effect(() => {
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
    const trimmedPrompt = this.prompt().trim();

    // Update prompt signal if it contained whitespace
    if (this.prompt() !== trimmedPrompt) {
      this.prompt.set(trimmedPrompt);
    }

    const params = {
      lengthDescription: this.storyLength(),
      genre: this.genre()
    };
    await this.storyService.generateStory(params, this.story);
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
