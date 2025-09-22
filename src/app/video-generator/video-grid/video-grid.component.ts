import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { GeneratedData } from '../../gemini/types/generated-image.type';

@Component({
  selector: 'app-video-grid',
  imports: [VideoPlayerComponent],
  templateUrl: './video-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGridComponent {
  videoInputs = input.required<GeneratedData[]>({ alias: 'videos' });
}
