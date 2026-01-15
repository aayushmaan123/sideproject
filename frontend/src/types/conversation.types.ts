export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
