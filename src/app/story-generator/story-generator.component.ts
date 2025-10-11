import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
import { ContainerComponent } from '../shared/container/container.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { LoaderComponent } from '../shared/loader/loader.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { ParserService } from '../shared/services/parser.service';
import { StoryService } from './services/story.service';
import { StoryGenerateMenuBarComponent } from './story-generate-menu-bar/story-generate-menu-bar.component';
import { StoryLength } from './types/story-length';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  imports: [
    ErrorDisplayComponent,
    LoaderComponent,
    PromptHistoryComponent,
    StoryGenerateMenuBarComponent,
    ContainerComponent
  ],
  styleUrl: '../shared/tailwind-utilities.css',
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

  length = signal<StoryLength>('short');
  genre = signal('fantasy');
  storyChunk = signal('');

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
      write: () => this.parserService.writeToElement(this.storyChunk())
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
      lengthDescription: this.length(),
      genre: this.genre()
    };
    await this.storyService.generateStory(
      params,
      this.storyChunk,
    );
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
