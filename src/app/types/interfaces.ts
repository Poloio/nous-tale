import { Player } from "./entities";

export interface Lobbied {
  playerExited(playerID: number, hostPlayerID: number): void;
  playerEntered(newPlayer: Player): void;
}
