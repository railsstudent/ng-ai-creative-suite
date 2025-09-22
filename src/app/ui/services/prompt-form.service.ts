import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PromptFormService {
  prompt = signal('');
  error = signal('');
  isLoading = signal(false);
  isGenerationDisabled = computed(() => !this.prompt().trim() || this.isLoading());
}
