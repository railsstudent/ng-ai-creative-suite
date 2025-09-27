import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageCardComponent } from '../image-card/image-card.component';
import { Image, ImageDownloadEvent } from '../types/image.type';

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
  regenerateImage = output<number>();
}
