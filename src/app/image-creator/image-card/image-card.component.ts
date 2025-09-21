import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CheckIconComponent } from '../../icons/check-icon.component';
import { DownloadIconComponent } from '../../icons/download-icon.component';
import { Image, ImageDownloadEvent } from '../types/image.type';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  imports: [DownloadIconComponent, CheckIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent {
  image = input.required<Image>();
  index = input.required<number>();
  isSelected = input(false);
  enableSelection = input(false);

  selected = output<number>();
  downloaded = output<ImageDownloadEvent>();

  onSelectImage(): void {
    // Only emit if selection is enabled to prevent accidental selections
    if (this.enableSelection()) {
      this.selected.emit(this.image().id);
    }
  }

  onDownloadImage(event: MouseEvent): void {
    event.stopPropagation();
    this.downloaded.emit({ imageUrl: this.image().url, index: this.index() });
  }
}
