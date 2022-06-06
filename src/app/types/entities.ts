
export type Player = {
  id: number;
  name: string;
  emoji: string;
  isHost: boolean;
}

export type Room = {
  id: number;
  code: string;
  maxPlayers: number;
  readyCount: number;
  gameHasStarted: boolean;
}
