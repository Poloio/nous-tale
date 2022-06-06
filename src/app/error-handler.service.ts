import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private ipc: IpcService) {
    window.onerror = (error, url, line) => {
      ipc.send('errorInWindow', error);
    }
  }

}
