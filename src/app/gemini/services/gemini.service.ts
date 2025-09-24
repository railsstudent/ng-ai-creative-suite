import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GenerateImagesConfig, GenerateVideosConfig, GenerateVideosParameters } from '@google/genai';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { GEMINI_AI_TOKEN, GEMINI_CHAT_TOKEN, GEMINI_TEXT_CONFIG_TOKEN } from '../constants/ai-injection-tokens.const';
import { GeneratedData } from '../types/generated-image.type';

const POLLING_PERIOD = 10000;
const apiKey = GEMINI_API_KEY;
const DEFAULT_GEMINI_MODEL_NAME = 'gemini-2.5-flash-lite';
const DEFAULT_IMAGE_MODEL_NAME = 'imagen-4.0-fast-generate-001';
const DEFAULT_VIDEO_MODEL_NAME = 'veo-2.0-generate-001';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private http = inject(HttpClient);
  private readonly ai = inject(GEMINI_AI_TOKEN);
  private readonly chat = inject(GEMINI_CHAT_TOKEN);
  private readonly genTextConfig = inject(GEMINI_TEXT_CONFIG_TOKEN);

  private getErrorMessage(error: unknown): string {
    console.error('Gemini API Error:', error);

    let rawMessage = '';
    if (error instanceof Error) {
        rawMessage = error.message;
    } else {
        try {
            rawMessage = JSON.stringify(error);
        } catch {
            rawMessage = String(error);
        }
    }

    if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('quota')) {
      return 'API quota exceeded. Please check your plan and billing details.';
    }

    // Try to extract a cleaner message from a potential JSON structure
    try {
        const parsed = JSON.parse(rawMessage);
        if (parsed?.error?.message) {
            return parsed.error.message;
        }
    } catch(e) {
        // Not JSON, or failed to parse.
        // We can just return the raw message if it's not JSON-like
        if (rawMessage && !rawMessage.trim().startsWith('{')) {
            return rawMessage;
        }
    }

    // Fallback for raw JSON errors or other complex objects
    return 'An unexpected error occurred. Please check the console for details.';
  }

  async generateTextStream(prompt: string) {
    try {
      return await this.ai.models.generateContentStream({
        model: GEMINI_MODEL_NAME || DEFAULT_GEMINI_MODEL_NAME,
        contents: prompt,
        config: this.genTextConfig
      });
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async generateImages(prompt: string, config: GenerateImagesConfig): Promise<GeneratedData[]> {
    try {
      const response = await this.ai.models.generateImages({
          model: IMAGE_MODEL_NAME || DEFAULT_IMAGE_MODEL_NAME,
          prompt,
          config: {
              ...config,
              outputMimeType: 'image/png',
          },
      });

      const images = response.generatedImages || [];

      return images.reduce((acc, img, id) => {
        if (!img.image?.imageBytes) {
          return acc;
        }

        return acc.concat({
          id,
          url: `data:image/png;base64,${img.image.imageBytes}`,
        });
      }, [] as GeneratedData[]);
    } catch (error) {
        throw new Error(this.getErrorMessage(error));
    }
  }

  async generateVideos(prompt: string, config: GenerateVideosConfig, imageBytes?: string): Promise<string[]> {
    try {
      const image = imageBytes ? { image: { imageBytes, mimeType: 'image/png' } } : undefined;
      const numberOfVideos = config.numberOfVideos || 1;

      const ranges: number[] = Array(numberOfVideos).fill(1);
      const model = VIDEO_MODEL_NAME || DEFAULT_VIDEO_MODEL_NAME;
      const downloadLinks = await ranges.reduce(async (prev) => {
        const request: GenerateVideosParameters = {
          model,
          prompt,
          config: { ...config, numberOfVideos: 1 },
          ...image
        };

        let operation = await this.ai.models.generateVideos(request);
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, POLLING_PERIOD));
          operation = await this.ai.operations.getVideosOperation({ operation });
        }

        const acc = await prev;
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            console.error('Video generation finished but no download link was provided.');
        }

        return downloadLink ? acc.concat(downloadLink) : acc;
      }, Promise.resolve([]) as Promise<string[]>);

      if (!downloadLinks.length) {
        return downloadLinks;
      }

      const blobUrls$ = forkJoin(downloadLinks.map((downloadLink) =>
          this.http.get(`${downloadLink}&key=${apiKey}`, {
            responseType: 'blob'
          }).pipe(
            map((blob) => URL.createObjectURL(blob))
          )
      ));
      return await firstValueFrom(blobUrls$);
    } catch (error) {
        throw new Error(this.getErrorMessage(error));
    }
  }

  async sendChatMessageStream(message: string) {
    try {
     return await this.chat.sendMessageStream({ message });
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }
}
