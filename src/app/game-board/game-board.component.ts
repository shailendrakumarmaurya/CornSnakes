import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeService, Position } from '../services/snake.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  board: number[][] = [];
  snake: Position[] = [];
  food: Position = { x: 0, y: 0 };
  gameOver = false;
  score = 0;
  private gameSubscription?: Subscription;
  private moveSubscription?: Subscription;

  constructor(private snakeService: SnakeService) {
    const size = this.snakeService.getBoardSize();
    this.board = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));
  }

  ngOnInit() {
    this.startGame();
    this.gameSubscription = this.snakeService.gameState$.subscribe((state) => {
      this.snake = state.snake;
      this.food = state.food;
      this.gameOver = state.gameOver;
      this.score = state.score;
    });

    this.moveSubscription = interval(150).subscribe(() => {
      if (!this.gameOver) {
        this.snakeService.moveSnake();
      }
    });
  }

  ngOnDestroy() {
    this.gameSubscription?.unsubscribe();
    this.moveSubscription?.unsubscribe();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const keyMap: { [key: string]: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' } = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
    };

    if (keyMap[event.key]) {
      this.snakeService.changeDirection(keyMap[event.key]);
    }
  }

  isSnake(x: number, y: number): boolean {
    return this.snake.some((segment) => segment.x === x && segment.y === y);
  }

  isFood(x: number, y: number): boolean {
    return this.food.x === x && this.food.y === y;
  }

  startGame() {
    this.snakeService.initGame();
  }

  getBoard() {
    return this.board;
  }
}
