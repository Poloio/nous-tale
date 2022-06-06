import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { HubConnection } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { ConnectionService } from './connection.service';
import { Room } from './types/entities';
import { Resolve } from './types/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RoomResolverService implements Resolve<Room> {

  hub: HubConnection;

  constructor(private connection: ConnectionService) { this.hub = connection.instance }

  resolve(route: ActivatedRouteSnapshot) : Promise<Room> {
    console.log('Called Get Room in resolver');
    let room: Promise<Room>;
    let code: string = route.params['code'];
    room = this.hub.invoke('GetRoomFromCode', code);
    return room;
  }
}
