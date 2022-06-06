import { animate, animation, query, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit, ErrorHandler } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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
  player: Player = {
    id: 0,
    name: '',
    isHost: false,
    emoji: ''
  }
  players: Player[] = [];// To avoid undefined exceptions
  roomCode: string;
  room: Room;
  hub: HubConnection;

  isLoggingIn: boolean = true;
  isConnected: boolean = true;
  isReady: boolean = false;
  countingDown: boolean = false;

  readonly countDownSeconds: number = 5;
  timerID: number;
  timerCounter: number = -1; // Negative to set first iteration to 0
  timerIsRunning: boolean = false;


  // ANGULAR METHODS ---------------------------------------------------------------

  constructor(private connection:ConnectionService, private routeFrom: ActivatedRoute,
    private router: Router, private errorHandler: ErrorHandler) {
    this.hub = connection.instance;
   }

  ngOnInit(): void {

    this.routeFrom.data.subscribe((response: any) => {
      console.log('Fetching room...');
      this.room = response.rooms;
      console.log(this.room,`Room ${this.room.code} fetched.`);
    });

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

    this.hub.on('readyCountChanged', (newCount) => this.onReadyCountChanged(newCount));
  }

  // SERVER METHODS CALLED THROUGH INVOKE ------------------------------------------

  async enterRoom() {
    try {
      console.log(`Entering as ${this.player.name}`);
      // Create a player for user and enter the room
      this.players = await this.hub.invoke(
        'EnterRoom',
        this.player.name,
        this.player.emoji,
        this.room.id
      );
      console.log(this.players,'Players');

    } catch(err) {
      console.error(err);
    }
    this.isLoggingIn = false;
    console.log('Entered successfully.');
  }

  async exitRoom() {
    try {
      await this.hub.invoke('ExitRoom', this.player.id);
      this.router.navigate(['']);

    } catch(err) {
      console.error(err);
    }
  }

  async toggleReady() {
    try {
      this.isReady= !this.isReady;
      await this.hub.invoke('ToggleReady', this.isReady, this.room.id)
    } catch(err) {
      console.error(err);
    }
  }

  // CLIENT METHODS CALLED BY SERVER --------------------------------------------

  onPlayerExited(playerID: number, hostPlayerID: number) {
    let gonePlayer = this.players.find(player => player.id === playerID)!;
    console.log(`${gonePlayer.name} logged out.`); // DEBUG

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

  onPlayerEntered(newPlayer: Player) {
    this.players.push(newPlayer);
    // TODO pretty popup
    console.log(`Player ${newPlayer.name} joined.`);
  }

  onReadyCountChanged(newReadyCount: number) {
    this.room.readyCount = newReadyCount;
    console.log(`Someone is ready! - ${this.room.readyCount}/${this.players.length}`);

    if (this.room.readyCount === this.players.length)
      this.startCountdown();
    else
      if (this.timerIsRunning)
        this.stopCountdown();
  }

  // LOCAL METHODS ----------------------------------------------------------

  startCountdown() {
    this.timerIsRunning = true;
    // Using window because Node.js is predetermined and returns Timeout instance
    this.timerID = window.setInterval(() => {
      this.timerCounter++;
      console.log(`Beginning in ${this.countDownSeconds - this.timerCounter}...`);
      if (this.timerCounter == this.countDownSeconds) {
        clearInterval(this.timerID)
        this.startGame();
      }
    }, 1000)
  }

  stopCountdown() {
    this.timerIsRunning = false;
    clearInterval(this.timerID);
    this.timerCounter = -1;
  }

  startGame() {
    this.router.navigate([`./game`, this.room.code]);
  }
}

