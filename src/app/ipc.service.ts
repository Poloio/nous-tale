import { Injectable } from '@angular/core';
import { IpcRenderer } from "electron";

@Injectable({
  providedIn: 'root'
})

export class IpcService {
  private ipc: IpcRenderer;

  constructor() {
    if (window.require) { // If using electron
      try {
        this.ipc = window.require("electron").ipcRenderer;
      } catch (ex) {
        throw ex;
      }
    } else {
      console.warn("Electron IPC not loaded");
    }
  }

  // Wrapper methods to access electron's IpcRenderer

  public on(channel: string, listener: any): void {
    /*
    Listens to the channel and calls listener when a new message arrives.
    */
    if (!this.ipc) {
      return;
    }
    this.ipc.on(channel, listener);
  }

  public once(channel: string, listener: any): void {
    /*
    Adds a one time listener for an event.
    */
    if (!this.ipc) {
      return;
    }
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    /*
    Sends an async message with args. (investigate)
    */
    if (!this.ipc) {
      return;
    }
    this.ipc.send(channel, ...args);
  }

  public removeAlllisteners(channel: string): void {
    /*
    Removes all listeners, from a channel if it's icluded. If not, it removes all of them.
    */
    if (!this.ipc) {
      return;
    }
    this.ipc.removeAllListeners(channel)
  }

}
