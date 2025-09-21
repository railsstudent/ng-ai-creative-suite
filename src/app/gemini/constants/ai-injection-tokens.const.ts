import { InjectionToken } from '@angular/core';
import { GoogleGenAI, Chat, Models, GenerateContentConfig } from '@google/genai';

export const GEMINI_AI_TOKEN = new InjectionToken<GoogleGenAI>('GoogleGenAIToken');
export const GEMINI_CHAT_TOKEN = new InjectionToken<Chat>('GoogleGenAIChatToken');
export const GEMINI_TEXT_CONFIG_TOKEN = new InjectionToken<GenerateContentConfig>('GoogleGenAITextConfigToken');
