import { animate, animation, query, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { inOut, inSnapOut } from '../animations'
import { Player, Room } from '../types/entities'
import { HubConnection } from '@microsoft/signalr';
import { Lobbied } from '../types/interfaces';
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass'],
  animations: [ inOut, inSnapOut ]
})
export class LobbyComponent implements OnInit, Lobbied {

  // All players in lobby/game are included in the SignalR group.
  player: Player;
  players: Player[];
  room: Room;
  hub: HubConnection;

  isLogged: boolean = false;
  isConnected: boolean = false;

  // ANGULAR METHODS ---------------------------------------------------------------

  constructor(private connection:ConnectionService, private router:Router) {
    this.hub = connection.instance;
   }

  ngOnInit(): void {
    this.hub.onclose = () => {
      this.router.navigate(['']);
      alert('Connection from server was lost.');
    }

    this.hub.onreconnecting = () => {
      this.isConnected = false;
    }

    this.hub.onreconnected = () => {
      this.isConnected = true;
    }
  }

  // SERVER METHODS CALLED THROUGH INVOKE ------------------------------------------

  async enterRoom() {
    try {
      this.players = await this.hub.invoke(
        this.player.name,
        this.player.emoji,
        this.room.id
      );
      this.isLogged = true;
    } catch(err) {
      console.error(err);
    }
  }

  async exitRoom() {
    try {
      this.hub.invoke('ExitRoom', this.player.id);
      this.router.navigate(['']);

    } catch(err) {
      console.error(err);
    }
  }

  // CLIENT METHODS CALLED BY SERVER --------------------------------------------

  playerExited(playerID: number, hostPlayerID: number) {
    let gonePlayer = this.players.find(player => player.id === playerID)!;
    console.log(`${gonePlayer.name} E`); // DEBUG

    // exitedPopup(gonePlayer); TODO this sometime

    // Remove gone player from players array
    let exitedId = gonePlayer.id;
    this.players = this.players.filter((value, index, arr) => {
      return value.id != exitedId;
    });

    // If hostPlayerID is -1, the host hasn't exited
    if (hostPlayerID !== -1)
      this.players.find(p => p.id === hostPlayerID)!.isHost = true;
  }

  playerEntered(newPlayer: Player) {
    this.players.push(newPlayer);
    // TODO pretty popup
    console.log(`Player ${newPlayer.name}`);
  }
}
