import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {

  instance: signalR.HubConnection;

  constructor() {
    this.instance = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44369/sessions')
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();
  }

  async start() {
    try {
      await this.instance.start();
      console.log("SignalR connected.")
    } catch (err) {
      console.log(err);
      setTimeout(this.start, 5000);
    }
  }


}
