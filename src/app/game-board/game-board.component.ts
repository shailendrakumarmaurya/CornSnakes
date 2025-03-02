import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeService, Direction } from '../services/snake.service';
import { interval, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Point } from '../models/point';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly BOARD_SIZE = 20;
  private readonly MOVE_INTERVAL = 150;

  snake = signal<Point[]>([]);
  food = signal<Point>({ x: 0, y: 0 });
  score = signal<number>(0);
  gameOver = signal<boolean>(false);

  board = computed(() => {
    const board: number[][] = [];
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      board[i] = Array(this.BOARD_SIZE).fill(0);
    }
    return board;
  });

  constructor(private snakeService: SnakeService) {
    effect(() => {
      const gameState = this.snakeService.gameState();
      this.snake.set(gameState.snake);
      this.food.set(gameState.food);
      this.gameOver.set(gameState.gameOver);
      this.score.set(gameState.score);
    });
  }

  ngOnInit(): void {
    this.startGame();

    interval(this.MOVE_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.gameOver())
      )
      .subscribe(() => {
        this.snakeService.moveSnake();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSnake(x: number, y: number): boolean {
    return this.snake().some((segment) => segment.x === x && segment.y === y);
  }

  isFood(x: number, y: number): boolean {
    const currentFood = this.food();
    return currentFood.x === x && currentFood.y === y;
  }

  getBoard(): number[][] {
    return this.board();
  }

  handleDirection(direction: Direction): void {
    if (!this.gameOver()) {
      this.snakeService.changeDirection(direction);
    }
  }

  startGame(): void {
    this.snakeService.startGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.gameOver()) return;

    const keyDirections: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
    };

    const direction = keyDirections[event.key];
    if (direction) {
      event.preventDefault();
      this.handleDirection(direction);
    }
  }
}
