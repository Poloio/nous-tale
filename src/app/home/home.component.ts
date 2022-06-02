import { animate, animation, state, style, transition, trigger } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { IpcService } from '../ipc.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  animations: [
    trigger('inOut', [
      transition(':enter', [
        style({ opacity: 0}),
        animate(
          '1s linear',
          style({ opacity: 1})
        )
      ]),
      transition(':leave', [
        animate('0s',
          style({ opacity: 0})
        )
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {

  connected: boolean = false;
  username: string;
  roomPassword: string = '';
  creatingRoom: boolean = false;
  enteringRoom: boolean = false;
  isPrivate: boolean = false;
  maxPlayers: number;

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


}
