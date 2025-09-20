import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatIconComponent } from './nav-icons/chat-icon.component';
import { ImageIconComponent } from './nav-icons/image-icon.component';
import { StoryIconComponent } from './nav-icons/story-icon.component';
import { VideoIconComponent } from './nav-icons/video-icon.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgComponentOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  navItems = [
    { path: '/story-generator', label: 'Story Generator', icon: StoryIconComponent },
    { path: '/image-creator', label: 'Image Creator', icon: ImageIconComponent },
    { path: '/video-generator', label: 'Video Creator', icon: VideoIconComponent },
    { path: '/chatbot', label: 'Chatbot', icon: ChatIconComponent }
  ];
}
