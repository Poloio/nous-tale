import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Player } from "./entities";

export interface Lobbied {
  onPlayerExited(playerID: number, hostPlayerID: number): void;
  onPlayerEntered(newPlayer: Player): void;
  onReadyCountChanged(newReadyCount: number): void;
}

export interface Resolve<T> {
  resolve(
   route: ActivatedRouteSnapshot,
   state: RouterStateSnapshot
  ): Observable<T> | Promise<T> | T;
}
