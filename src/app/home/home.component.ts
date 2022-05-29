import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../connection.service';
import { IpcService } from '../ipc.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  connected: boolean = false;
  username: string;
  roomPassword: string;

  signalr: signalR.HubConnection;


  constructor(private ipcService: IpcService, private cdRef: ChangeDetectorRef,
    private connection: ConnectionService, public router: Router) {
      this.signalr = connection.instance;
  }

  ngOnInit(): void {

  }

  async createRoom() {
    try {
      let roomId = await this.signalr.invoke('CreateRoom', 10, this.roomPassword);
      console.log(`Room ${roomId} created, entering...`);

      let players = await this.signalr.invoke('EnterRoom', this.username, roomId);
      console.log(players);

      this.signalr.invoke('ConnectToGroup', roomId);
      console.log('Room entered successfuly.');

      this.router.navigate([`${roomId}`])
    } catch (err) {
      console.error(err);
    }
  }
}
