import { StringMap } from "@angular/compiler/src/compiler_facade_interface";

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
  roundReadyCount: number;
  gameHasStarted: boolean;
}

export type RoomWithPlayers = {
  room: Room;
  players: Player[];
}

export type Tale = {
  id: number;
  roomId: number;
  title: string;
  chapters: Chapter[];
}

export type Chapter = {
  id: number;
  taleId: number;
  text: string;
  mood: string;
  playerId: number;
}
