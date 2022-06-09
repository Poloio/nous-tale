import { Component, Input, OnInit } from '@angular/core';
import { time } from 'console';
import { ConnectionService } from '../connection.service';
import { Player, Room, Tale } from '../types/entities';

@Component({
  selector: 'app-after',
  templateUrl: './after.component.html',
  styleUrls: ['./after.component.sass']
})
export class AfterComponent implements OnInit {

  @Input() room: Room;
  @Input() tales: Tale[];
  @Input() players: Player[];
  @Input() player: Player;

  playingTale: Tale;
  taleNumber: number = 0;
  votedSkip: boolean = false;
  readingEnded: boolean = false;

  readonly SECONDS_PER_CHAPTER: number = 15;
  nextTimer: {id: number, counter: number, isRunning: boolean} =
  {id: 0, counter: 0, isRunning: false}

  async elapse() {
    this.nextTimer.counter++;
    let readingTime = this.SECONDS_PER_CHAPTER * this.playingTale.chapters.length;
    if (this.nextTimer.counter >= readingTime) {
      clearInterval(this.nextTimer.id);
      this.nextTimer.isRunning = false;
      this.readingEnded = true;
      this.votedSkip = true;
      await this.toggleSkip();
    }
  }

  constructor(private connection: ConnectionService) { }

  ngOnInit(): void {
    this.playingTale = this.tales[this.taleNumber];
  }

  async toggleSkip() {
    // toggle skip in server
  }

  startInterval() {
    this.nextTimer.id = window.setInterval(async () => this.elapse(), 1000);
    this.nextTimer.isRunning = true;
  }

  async nextTale() {
    if (this.nextTimer.isRunning) clearInterval(this.nextTimer.id);
    this.taleNumber++;
    this.playingTale = this.tales[this.taleNumber];
    this.readingEnded = false;
    this.votedSkip = false;
    this.startInterval();
  }

}
