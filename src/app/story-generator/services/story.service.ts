import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { GeminiService } from '../../gemini/services/gemini.service';
import { ParserService } from '../../shared/services/parser.service';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';
import storyConfig from '../story-commands.json';
import { StoryOption } from '../types/story-option';
import { StoryParams } from '../types/story-params';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly geminiService = inject(GeminiService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly parserService = inject(ParserService);

  private readonly historyKey = 'story';

  readonly promptHistory = this.promptHistoryService.getHistory(this.historyKey).asReadonly();

  readonly prompt = signal('');
  readonly isLoading = signal(false);
  readonly error = signal('');

  getStoryLengthOptions(): StoryOption[] {
    return storyConfig.length;
  }

  getGenreOptions(): StoryOption[] {
    return storyConfig.genre.sort((a, b) => a.value.localeCompare(b.value));
  }

  async generateStory(
    prompt: string,
    params: StoryParams,
    chunkSignal: WritableSignal<string>,
  ): Promise<void> {

    try {
      this.isLoading.set(true);
      this.error.set('');

      // Update prompt signal if it contained whitespace
      if (this.prompt() !== prompt) {
        this.prompt.set(prompt);
      }

      // The service now handles trimming and empty checks for history
      this.promptHistoryService.addPrompt(this.historyKey, prompt);

      const fullPrompt = this.getFullPrompt(params);
      const stream = await this.geminiService.generateTextStream(fullPrompt);
      this.isLoading.set(false);

      for await (const chunk of stream) {
        const chunkText = chunk.candidates?.[0].content?.parts?.[0].text || '';
        const markdownText = chunkText.replace(/\n\n/g, '<br><br>')
        chunkSignal.set(markdownText);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to generate story. Please try again.');
      console.error(e);
    } finally {
      this.parserService.flushAll();
      this.isLoading.set(false);
    }
  }

  private getFullPrompt({ length, genre }: StoryParams) {
    const lengthDescriptionMap = storyConfig.lengthDescription as {
      [key in StoryParams['length']]: string;
    };
    const lengthInstruction = lengthDescriptionMap[length] || '';

    const fullPrompt = `Write ${lengthInstruction} creative ${genre} story based on the following prompt: "${this.prompt()}"`;
    return fullPrompt;
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.historyKey);
  }
}
