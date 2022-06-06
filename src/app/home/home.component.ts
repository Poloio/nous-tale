import { animate, animation, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { IpcService } from '../ipc.service';
import { inOut, inSnapOut } from '../animations'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  animations: [ inOut, inSnapOut ]
})
export class HomeComponent implements OnInit {

  connected: boolean = false;

  username: string;
  roomPassword: string = '';
  creatingRoom: boolean = false;
  enteringRoom: boolean = false;

  isPrivate: boolean = false;
  maxPlayerOptions: number[] = [ 4, 8, 12 ];
  maxPlayers: number = 8;

  roomCode: string = '';

  signalr: signalR.HubConnection;


  constructor(private ipcService: IpcService, private cdRef: ChangeDetectorRef,
    private connection: ConnectionService, public router: Router) {
  }

  ngOnInit(): void {
    this.signalr = this.connection.instance;
  }

  showCreateRoom() {
    this.enteringRoom = false;
    this.creatingRoom = true;
  }

  showEnterRoom() {
    this.creatingRoom = false;
    this.enteringRoom = true;
  }

  async createRoom() {
    // Creates the room in the server and navigates
    try {
      let roomCode = await this.signalr.invoke('CreateRoom',
          10,
          this.isPrivate ? this.roomPassword : null
        );

      console.log(`Room ${roomCode} created, entering...`);
      this.router.navigate([`${roomCode}`])
    } catch (err) {
      console.error(err);
    }
  }

  async enterRoom() {
    let roomExists = await this.signalr.invoke('RoomExists', this.roomCode);
    if (roomExists)
      this.router.navigate([this.roomCode]);
    else
      alert("Room doesn't exist.");
  }

  setMaxPlayers(max: number) {
    this.maxPlayers = max;
  }


}
