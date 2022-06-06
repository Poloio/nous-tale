import { animate, animation, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { autoUpdater } from 'electron';
import { ConnectionService } from '../connection.service';
import { inOut, inSnapOut } from '../animations';
import { Player, Room, Tale } from '../types/entities';
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

  roundNum: number = 0;
  playerIndex: number;
  roundNumber: number;

  isFirstTale: boolean = true;
  currentTale: Tale;
  isReadyNxtRound: boolean = false;

  readonly LIMIT_SECONDS: number = 20;
  limitTimer = {id: 0, counter: 0, isRunning: false}
  elapse(): void {
    this.limitTimer.counter++;
    if (this.limitTimer.counter == this.LIMIT_SECONDS) {
      clearInterval(this.limitTimer.id)
      this.loadNextRound();
    }
  }

  getTaleIndex(): number {
    let index: number;
    this.playerIndex + this.roundNum < this.players.length
      // 4 players: J2 takes Tale#1 at round 3
      ? index = this.playerIndex + this.roundNum
      : index = this.playerIndex + this.roundNum - this.players.length;
    return index;
  }

  constructor(private connection: ConnectionService, private route: ActivatedRoute) {
    this.hub = connection.instance;
  }

  ngOnInit(): void {
    this.playerIndex = this.players.indexOf(this.player);
    console.log(`Index of player: ${this.playerIndex}`);

    this.currentTale = this.tales[this.getTaleIndex()];

    this.startTimer()

    this.hub.on('taleWasUpdated', (updatedTale: Tale, index: number) =>
      this.tales[index] = updatedTale );
    this.hub.on('everyoneIsReady', () => this.loadNextRound());
  }

  startTimer() {
    this.limitTimer.id = window.setInterval(() => this.elapse(), 1000)
  }

  async sendUpdatedTale(updatedTale: Tale) {
    await this.hub.invoke('UpdateTale', updatedTale, this.tales.indexOf(this.currentTale));
  }

  async toggleReady() {
    this.isReadyNxtRound = !this.isReadyNxtRound;
    await this.hub.invoke('RoundReadyChanged', this.isReadyNxtRound);
  }

  loadNextRound() {
    this.sendUpdatedTale(this.currentTale);
    this.roundNum++;
    this.currentTale = this.tales[this.getTaleIndex()];
    this.isFirstTale = false;
    this.isReadyNxtRound = false;
    this.startTimer();
  }
}
