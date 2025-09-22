import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_AI_TOKEN, GEMINI_CHAT_TOKEN, GEMINI_TEXT_CONFIG_TOKEN } from '../constants/ai-injection-tokens.const';

const apiKey = GEMINI_API_KEY;

export function provideGoogleGeminiAi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI_TOKEN,
      useFactory: () => {
        if (!apiKey) {
          console.error("API_KEY is not set. Please ensure it's available in the environment.");
        }
        return new GoogleGenAI({ apiKey });
      },
    },
    {
      provide: GEMINI_TEXT_CONFIG_TOKEN,
      useValue:  {
        maxOutputTokens: +MAX_OUTPUT_TOKEN,
        temperature: +TEMPERATURE,
        topK: +TOP_K,
        topP: +TOP_P,
      }
    },
    {
      provide: GEMINI_CHAT_TOKEN,
      useFactory: () => {
        const ai = inject(GEMINI_AI_TOKEN);
        return ai.chats.create({
          model: GEMINI_MODEL_NAME || 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are a helpful and creative assistant. Please provide answers, maximum 250 words.',
            temperature: +TEMPERATURE,
            topK: +TOP_K,
            topP: +TOP_P,
            maxOutputTokens: +CHAT_MAX_OUTPUT_TOKEN,
          },
        });
      },
    }
  ]);
}
