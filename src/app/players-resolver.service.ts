import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { HubConnection } from '@microsoft/signalr';
import { ConnectionService } from './connection.service';
import { Player, Room, RoomWithPlayers } from './types/entities';

@Injectable({
  providedIn: 'root'
})
export class PlayersResolverService {

  hub: HubConnection;

  constructor(connection: ConnectionService) { this.hub = connection.instance; }

  resolve(route: ActivatedRouteSnapshot) : Promise<RoomWithPlayers> {
    console.log('Called Get RoomAndPlayers in resolver');
    let vm: Promise<RoomWithPlayers>;
    let code: string = route.params['code'];
    vm = this.hub.invoke('GetRoomAndPlayers', code);
    return vm;
  }
}
