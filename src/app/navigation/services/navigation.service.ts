import { Injectable } from '@angular/core';
import { StoryIconComponent } from '../nav-icons/story-icon.component';
import { ChatIconComponent } from '../nav-icons/chat-icon.component';
import { ImageIconComponent } from '../nav-icons/image-icon.component';
import { VideoIconComponent } from '../nav-icons/video-icon.component';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  getNavItems() {
    return [
      { path: '/story-generator', label: 'Story Generator', icon: StoryIconComponent },
      { path: '/chatbot', label: 'Chatbot', icon: ChatIconComponent },
      { path: '/image-creator', label: 'Image Creator', icon: ImageIconComponent },
      { path: '/video-generator', label: 'Video Creator', icon: VideoIconComponent },
    ]
  }
}
