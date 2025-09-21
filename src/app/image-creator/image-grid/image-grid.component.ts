import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageCardComponent } from '../image-card/image-card.component';
import { ImageDownloadEvent, Image } from '../types/image.type';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  imports: [ImageCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGridComponent {
  images = input.required<Image[]>();
  selectedImageId = input<number | null>(null);
  enableSelection = input(false);

  imageSelected = output<number>();
  imageDownloaded = output<ImageDownloadEvent>();

  onSelectImage(id: number): void {
    this.imageSelected.emit(id);
  }

  onDownloadImage(event: ImageDownloadEvent): void {
    this.imageDownloaded.emit(event);
  }
}
