import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { IpcService } from '../ipc.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  pong: boolean = false;
  constructor(private ipcService: IpcService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    let button = document.getElementById("button");
    button?.addEventListener('click', this.ping);
  }

  ping = (): void => {
    this.ipcService.send("message","ping");
    // Set listener for response and detect changes, returns message if reply is "pong"
    this.ipcService.on("reply", (event: any, arg: string) => {
      this.pong = arg === "pong";
      this.cdRef.detectChanges()
    });
  }

}
