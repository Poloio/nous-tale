import { animate, animation, query, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit, ErrorHandler } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { inOut, inSnapOut } from '../animations'
import { GameState, Player, Room, Tale } from '../types/entities'
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

  /** This client's player. */
  player: Player = {
    id: 0,
    name: '',
    isHost: false,
    emoji: ''
  }

  /** Represents the game state to control which screen is showing */
  gameState: GameState;
  /** Holds a class instance to be accessed in the HTML and check values. */
  enumValues = GameState;
  /** Event triggered by child components to affect the general game state */
  onGameStateChanged(newState: GameState) {
    this.gameState = newState;
    console.log(`Game state changed to ${this.gameState.toString()} at parent component.`);
    this.cdref.detectChanges();
  }

  /** Array that represents the players in the server */
  players: Player[] = [];// To avoid undefined exceptions
  roomCode: string;
  room: Room;
  hub: HubConnection;

  /** All the tales in the server, if updated */
  tales: Tale[];
  onTalesUpdated(newTales: Tale[]) {
    this.tales = newTales;
    console.log('Tales updated at parent component.');
    this.cdref.detectChanges();
  }

  roomPasswordTry: string = '';

  isLoggingIn: boolean = true;
  isConnected: boolean = true;
  isReady: boolean = false;
  countingDown: boolean = false;

  /** Constant to control how many seconds to wait before beginning */
  readonly COUNTDOWN_SECONDS: number = 5;
  /** ID used to stop a running timer */
  timerID: number;
  /** Counter to track how many seconds passed. */
  timerCounter: number = -1; // Negative to set first iteration to 0
  /** @returns true if the begin timer is running. */
  timerIsRunning: boolean = false;
  /** @returns true if the game has started */
  gameStarted: boolean = false;


  // ANGULAR METHODS ---------------------------------------------------------------

  constructor(private connection:ConnectionService, private routeFrom: ActivatedRoute,
    private router: Router, private errorHandler: ErrorHandler, private cdref: ChangeDetectorRef) {
    this.hub = connection.instance;
   }

  ngOnInit(): void {

    this.gameState = GameState.IN_LOBBY;

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

    this.hub.on('talesCreated', (newTales) => {
      this.tales = newTales;
      console.log(this.tales, 'Tales');
      console.log('Tales received.');
      this.gameState = GameState.IN_GAME;
      this.cdref.detectChanges();
    });

    this.hub.on('playerEntered', (newPlayer: Player) => this.onPlayerEntered(newPlayer));

    this.hub.on('playerExited', (playerID: number, hostPlayerID: number) =>
      this.onPlayerExited(playerID, hostPlayerID) );
  }

  // SERVER METHODS CALLED THROUGH INVOKE ------------------------------------------
  /** Checks login info. If all is correct, fetches the players and enters the room. */
  async enterRoom() {
    try {
      console.log(`Entering as ${this.player.name}`);

      if (this.room.isPrivate) {
        if (this.room.password !== this.roomPasswordTry) {
          alert('This password is incorrect.')
          return;
        }
      }

      let tempPlayers: Player[] = await this.hub.invoke('GetPlayers', this.room.id);

      let nameAlreadyExists = tempPlayers.every(p => p.name === this.player.name);
      if(nameAlreadyExists) alert('This name is already taken.');
      let emojiAlreadyExists = tempPlayers.every(p => p.name === this.player.name);
      if(emojiAlreadyExists) alert('This emoji is already taken.');
      if(nameAlreadyExists || emojiAlreadyExists) return;

      // Create a player for user and enter the room
      this.players = await this.hub.invoke(
        'EnterRoom',
        this.player.name,
        this.player.emoji,
        this.room.id
      );

      this.player = this.players.find(p => p.name === this.player.name)!;
      console.log(this.player,'This player');

    } catch(err) {
      console.error(err);
    }
    this.isLoggingIn = false;
    console.log('Entered successfully.');
  }

  /** Exits the room and notifies all players */
  async exitRoom() {
    try {
      await this.hub.invoke('ExitRoom', this.player.id);
      this.router.navigate(['']);

    } catch(err) {
      console.error(err);
    }
  }

  /** Toggles if the player is ready and notifies the server. */
  async toggleReady() {
    try {
      this.isReady= !this.isReady;
      await this.hub.invoke('ToggleReady', this.isReady, this.room.id)
    } catch(err) {
      console.error(err);
    }
  }

  // CLIENT METHODS CALLED BY SERVER --------------------------------------------

  /** Manages when a player exits the room. */
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
    this.cdref.detectChanges();
  }

  /** Manages when other player entered the room */
  onPlayerEntered(newPlayer: Player) {
    this.players.push(newPlayer);
    // TODO pretty popup
    console.log(`Player ${newPlayer.name} joined.`);
    this.cdref.detectChanges();
  }

  /** Manages when other player toggles their ready state */
  onReadyCountChanged(newReadyCount: number) {
    this.room.readyCount = newReadyCount;
    console.log(`Someone is ready! - ${this.room.readyCount}/${this.players.length}`);

    if (this.room.readyCount === this.players.length)
      this.startCountdown();
    else
      if (this.timerIsRunning)
        this.stopCountdown();
    this.cdref.detectChanges();
  }

  onTalesCreated(newTales: Tale[]) {
    this.tales = newTales;
  }

  // LOCAL METHODS ----------------------------------------------------------
  /** Starts the timer countdown */
  startCountdown() {
    this.timerIsRunning = true;
    // Using window because Node.js is predetermined and returns Timeout instance
    this.timerID = window.setInterval(() => {
      this.timerCounter++;
      console.log(`Beginning in ${this.COUNTDOWN_SECONDS - this.timerCounter}...`);
      if (this.timerCounter >= this.COUNTDOWN_SECONDS) {
        clearInterval(this.timerID)
        this.startGame();
      }
    }, 1000)
  }

  /** Stops lobby's countdown timer */
  stopCountdown() {
    this.timerIsRunning = false;
    clearInterval(this.timerID);
    this.timerCounter = -1;
  }

  /** Starts the game */
  async startGame() {
    this.stopCountdown();
    console.log('Server creating tales...');
    if (this.player.isHost) await this.hub.invoke('CreateTales', this.room.id);
    console.log('Tales created.');
  }
}


