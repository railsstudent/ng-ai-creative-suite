import { ChatMessage } from '../types/chat-message.type';

export const MAX_CHARACTER_COUNT = 500;

export const INITIAL_BOT_MESSAGE: ChatMessage = { id: 0, sender: 'bot', text: 'Hello! How can I help you today?' };
