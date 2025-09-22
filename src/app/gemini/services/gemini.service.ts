import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { GEMINI_AI_TOKEN, GEMINI_CHAT_TOKEN, GEMINI_TEXT_CONFIG_TOKEN } from '../constants/ai-injection-tokens.const';
import { GeneratedBase64Image } from '../types/generated-image.type';

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
        model: GEMINI_MODEL_NAME || 'gemini-2.5-flash',
        contents: prompt,
        config: this.genTextConfig
      });
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async generateImages(prompt: string, numberOfImages: number, aspectRatio: string): Promise<GeneratedBase64Image[]> {
    try {
      const response = await this.ai.models.generateImages({
          model: IMAGE_MODEL_NAME || 'imagen-4.0-generate-001',
          prompt,
          config: {
              numberOfImages,
              outputMimeType: 'image/png',
              aspectRatio,
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
      }, [] as GeneratedBase64Image[]);
    } catch (error) {
        throw new Error(this.getErrorMessage(error));
    }
  }

  async generateVideo(prompt: string, imageBytes?: string): Promise<string | null> {
    try {
        const defaultRequest = {
            model: VIDEO_MODEL_NAME || 'veo-3.0-generate-001',
            prompt,
            config: {
                numberOfVideos: 1
            }
        };

        const image = imageBytes ? { image: { imageBytes, mimeType: 'image/png' } } : {};
        const request = { ...defaultRequest, ...image };
        const polling_period = 10000;

        let operation = await this.ai.models.generateVideos(request);
        while (!operation.done) {
            // Polling every 10 seconds as per docs example
            await new Promise(resolve => setTimeout(resolve, polling_period));
            operation = await this.ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            console.error('Video generation finished but no download link was provided.');
            return null;
        }

        const apiKey = GEMINI_API_KEY;

        // The API key is needed for the download
        if (!apiKey) {
            throw new Error("API_KEY is not set. Cannot download video.");
        }

        const blobUrl = this.http.get(`${downloadLink}&key=${apiKey}`, {
          responseType: 'blob'
        }).pipe(
          map((blob) => URL.createObjectURL(blob))
        );

        return await firstValueFrom(blobUrl);
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
