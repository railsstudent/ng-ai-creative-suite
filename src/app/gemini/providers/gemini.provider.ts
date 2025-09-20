import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_AI_TOKEN, GEMINI_CHAT_TOKEN } from '../constants/ai-injection-tokens.const';
import { GEMINI_MODEL_NAME } from '../constants/model-name.const';

export function provideGoogleGeminiAi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI_TOKEN,
      useFactory: () => {
        const apiKey = GEMINI_API_KEY ?? '';
        if (!apiKey) {
          console.error("API_KEY is not set. Please ensure it's available in the environment.");
        }
        return new GoogleGenAI({ apiKey });
      },
    },
    {
      provide: GEMINI_CHAT_TOKEN,
      useFactory: () => {
        const ai = inject(GEMINI_AI_TOKEN);
        return ai.chats.create({
          model: GEMINI_MODEL_NAME,
          config: {
            systemInstruction: 'You are a helpful and creative assistant.',
          },
        });
      },
    }
  ]);
}
