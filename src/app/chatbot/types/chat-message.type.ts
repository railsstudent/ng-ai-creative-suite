export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}
