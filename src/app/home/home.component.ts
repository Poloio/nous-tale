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

      this.signalr.on('EnterRoom', (room) => {
        router.navigate([`session/${room.Code}`]);
      });
  }

  ngOnInit(): void {
    this.signalr.start();
  }

  async createRoom() {
    try {
      await this.signalr.invoke('CreateRoom', this.username, 10, this.roomPassword);
      console.log('Invoked API');
    } catch (err) {
      console.log(err);
    }
  }
}
