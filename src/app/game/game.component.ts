import { animate, animation, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit, Input, enableProdMode } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { inOut, inSnapOut } from '../animations';
import { Chapter, Player, Room, Tale } from '../types/entities';
import { HubConnection } from '@microsoft/signalr';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
  animations: [ inOut, inSnapOut ]
})

export class GameComponent implements OnInit {

  hub: HubConnection;

  @Input() room: Room;
  @Input() players: Player[];
  @Input() player: Player;
  @Input() tales: Tale[];

  /** Counter to track current round.*/
  roundNum: number = 0;
  /** Stores the player's index in the game to be able to track
   * what tale is next even if the said array changes. */
  playerIndex: number;
  /** Used to know if this turn the player has to name a title for the {@link Tale}. */
  isFirstTale: boolean = true;
  /** Stores the current round's tale to be accesed by the UI to offer editing controls. */
  currentTale: Tale;
  /** Represents if this user is ready for the next round. */
  isReadyNxtRound: boolean = false;
  /** Represents if the round is over and client is waiting or new tales */
  waitingForUpdate: boolean = false;

  /** Constant that stores how many seconds the players have to write every round. */
  readonly LIMIT_SECONDS: number = 30;
  /** Custom object to store the interval neccesary values. */
  limitTimer: {id: number, counter: number, isRunning: boolean} =
    {id: 0, counter: 0, isRunning: false}

  /** Function that later defines the countdown for every round. */
  elapse(): void {
    this.limitTimer.counter++;
    let currentLimit = this.isFirstTale ? 10+this.LIMIT_SECONDS : this.LIMIT_SECONDS;
    console.log(`${currentLimit-this.limitTimer.counter} seconds left.`);
    if (this.limitTimer.counter === currentLimit) {
      this.limitTimer.counter = 0;
      clearInterval(this.limitTimer.id);
      this.sendUpdatedTale(this.currentTale);
    }
  }

  /**
   * @returns {number} The corresponding tale index for the current round.
   */
  getTaleIndex(): number {
    let index: number;
    this.playerIndex + this.roundNum < this.players.length
      // 4 players: J2 takes Tale#1 at round 3
      ? index = this.playerIndex + this.roundNum // p0 + r0 = t0
      : index = this.playerIndex + this.roundNum - this.players.length; //p1/1 + r1 =
    return index;
  }

  /** Gets last chapter in the tale with text. Used to display the last chapter
     * written by a player every round.
     * @returns {Chapter} Last written chapter.
     */
  getLastChapter(): Chapter {
    return this.currentTale.chapters
      .slice() // Make a copy bc reverse is mutable
      .reverse()
      .find(ch => ch.text.length > 0)!;
  }

  /**
   * @constructor
   * @param {ConnectionService} connection Service used to access SignalR methods
   */
  constructor(private connection: ConnectionService, private cdref: ChangeDetectorRef) {
    this.hub = connection.instance;
  }

  ngOnInit(): void {
    this.playerIndex = this.players.indexOf(this.player);
    console.log(`Index of player: ${this.playerIndex}`);

    this.currentTale = this.tales[this.getTaleIndex()];
    console.log(this.currentTale, 'Current tale');

    this.startTimer();

    this.hub.on('talesWereUpdated', (updatedTale: Tale, index: number) => {
      console.log(updatedTale, 'Updated tale');
      this.tales[index] = updatedTale;
      this.cdref.detectChanges();
      this.loadNextRound();
    });
    this.hub.on('everyoneIsReady', () => this.loadNextRound());
  }

  /** Starts the timeout countdown for current round. */
  startTimer() {
    console.log('Timer started.');
    this.limitTimer.id = window.setInterval(() => this.elapse(), 1000);
  }

  /** Sends a tale to the server to be updated for everyone else.
   * @param {Tale} updatedTale The tale to be updated.
   */
  async sendUpdatedTale(updatedTale: Tale) {
    console.log(`Sending tale ${updatedTale.id} to server to be updated...`);
    await this.hub.invoke('UpdateTale', updatedTale, this.tales.indexOf(this.currentTale));
    console.log(`Tale ${updatedTale.id} updated.`);
    this.cdref.detectChanges();
  }

  /** Toggles {@link isReadyNxtRound} flag in the code, and notifies this change
   *  to the server.
   */
  async toggleReady() {
    this.isReadyNxtRound = !this.isReadyNxtRound;
    await this.hub.invoke('RoundReadyChanged', this.room.id,this.isReadyNxtRound);
  }

  /** Loads next game round, resetting needed properties and advancing counters
   * to use them for the next. If it was the last round, the game finishes.
   */
  loadNextRound() {
    this.waitingForUpdate = false;
    console.log(`Round ${this.roundNum} ended.`);
    this.roundNum++;
    if (this.roundNum <= this.players.length - 1) {
      this.currentTale = this.tales[this.getTaleIndex()];
      console.log(this.currentTale, 'Current tale after round');
      this.isFirstTale = false;
      this.isReadyNxtRound = false;
      this.startTimer();
      console.log('Next round loaded');
    } else {
      this.finishGame();
      console.log('Game ended');
    }
  }

  finishGame() {
    // Load stories and show them. Mood music? Voice synth?
  }
}
