import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'story-generator',
    loadComponent: () => import('./story-generator/story-generator.component'),
    title: 'Story Generator'
  },
  {
    path: 'image-creator',
    loadComponent: () => import('./image-creator/image-creator.component'),
    title: 'Image Creator'
  },
  {
    path: 'video-generator',
    loadComponent: () => import('./video-generator/video-generator.component'),
    title: 'Video Generator'
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./chatbot/chatbot.component'),
    title: 'Chatbot'
  },
  {
    path: '',
    redirectTo: '/story-generator',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/story-generator'
  }
];
