import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Image, ImageDownloadEvent } from '../types/image.type';
import { CheckIconComponent } from './icons/check-icon.component';
import { DownloadIconComponent, RegenerateIconComponent } from './icons/download-icon.component';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  imports: [FormsModule, DownloadIconComponent, CheckIconComponent, RegenerateIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent {
  image = input.required<Image>();
  index = input.required<number>();
  isSelected = input(false);
  enableSelection = input(false);

  selected = output<number>();
  downloaded = output<ImageDownloadEvent>();
  regenerate = output<number>();

  onSelectImage(): void {
    // Only emit if selection is enabled to prevent accidental selections
    if (this.enableSelection()) {
      this.selected.emit(this.image().id);
    }
  }
}
