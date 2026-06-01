// Canonical source for RealtimeMessageType — used across all love-space components
export type RealtimeMessageType =
  | 'chat'
  | 'game_move'
  | 'dice_roll'
  | 'dice_resolved'
  | 'dice_start'
  | 'token_moving'
  | 'sync_request'
  | 'sync_state'
  | 'chat_sync_request'
  | 'chat_sync_state'
  | 'ping'
  | 'pong'
  | 'player_ready'
  | 'ack'
  | 'typing'
  | 'reaction'
  | 'flames_reveal'
  | 'flames_sync'
  | 'presence_update'
  | 'room_closed'
  | 'wake_up'
  | 'game_over'
  | 'play_again';

export interface RealtimeMessage {
  type: RealtimeMessageType;
  payload?: any;
  id?: string;
}

