import { inject, Injectable, signal } from '@angular/core';
import { GeneratedData } from '../../gemini/types/generated-image.type';
import { ImageDownloadEvent } from '../types/image.type';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageConfirmationService {
    imageService = inject(ImageService);

    #selectedImageId = signal<number | null>(null);

    // New state for confirmation dialog
    #showConfirmation = signal<'download' | 'regenerate' | 'none'>('none');
    #imageToDownload = signal<ImageDownloadEvent | null>(null);
    #imageToRegenerate = signal(-1);

    showConfirmation = this.#showConfirmation.asReadonly();
    imageToDownload = this.#imageToDownload.asReadonly();
    imageToRegenerate = this.#imageToRegenerate.asReadonly();
    selectedImageId = this.#selectedImageId.asReadonly();

    selectImage(id: number): void {
      this.#selectedImageId.update(currentId => currentId === id ? null : id);
    }

    resetImage() {
      this.#selectedImageId.set(null);
    }

    setDownloadImage(image: ImageDownloadEvent): void {
      this.#imageToDownload.set(image);
      this.#showConfirmation.set('download');
    }

    setRegenerateImage(id: number) {
      this.#imageToRegenerate.set(id);
      this.#showConfirmation.set('regenerate');
    }

    async doConfirm(aspectRatio: string): Promise<GeneratedData | undefined> {
      if (this.#showConfirmation() === 'download') {
        this.confirmDownload();
      } else if (this.#showConfirmation() === 'regenerate') {
        const newImage = await this.confirmRegenerate(aspectRatio);
        return newImage;
      }

      return undefined;
    }

    doCancel() {
      if (this.#showConfirmation() === 'download') {
        this.cancelDownload();
      } else if (this.#showConfirmation() === 'regenerate') {
        this.cancelRegenerate();
      }
    }

    private confirmDownload(): void {
      const image = this.#imageToDownload();
      if (!image) {
        return;
      }

      this.imageService.downloadImage(image);
      this.cancelDownload();
    }

    private cancelDownload(): void {
      this.#showConfirmation.set('none');
      this.#imageToDownload.set(null);
    }

    regenerateImage(index: number): void {
      this.#imageToRegenerate.set(index);
      this.#showConfirmation.set('regenerate');
    }

    private async confirmRegenerate(aspectRatio: string): Promise<GeneratedData | undefined> {
      if (this.#imageToRegenerate() < 0) {
        return;
      }

      const imageId = this.#imageToRegenerate();
      this.cancelRegenerate();

      const config = {
        numberOfImages: 1,
        aspectRatio,
      };

      const image = await this.imageService.regenerateImage(config);
      return image ? { ...image, id: imageId } : undefined;
    }

    private cancelRegenerate(): void {
      this.#showConfirmation.set('none');
      this.#imageToRegenerate.set(-1);
    }
}
