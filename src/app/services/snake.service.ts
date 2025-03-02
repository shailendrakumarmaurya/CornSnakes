import { Injectable, signal, computed } from '@angular/core';
import { Point } from '../models/point';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface GameState {
  snake: Point[];
  food: Point;
  score: number;
  gameOver: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SnakeService {
  private readonly BOARD_SIZE = 20;
  private readonly INITIAL_SNAKE: Point[] = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ];

  private currentDirection = signal<Direction>('UP');
  private gameStateSignal = signal<GameState>({
    snake: this.INITIAL_SNAKE,
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false,
  });

  gameState = computed(() => this.gameStateSignal());

  constructor() {
    this.gameStateSignal.update((state) => ({
      ...state,
      food: this.generateFood(state.snake),
    }));
  }

  private generateFood(currentSnake: Point[]): Point {
    const food: Point = {
      x: Math.floor(Math.random() * this.BOARD_SIZE),
      y: Math.floor(Math.random() * this.BOARD_SIZE),
    };

    if (
      currentSnake.some(
        (segment) => segment.x === food.x && segment.y === food.y
      )
    ) {
      return this.generateFood(currentSnake);
    }

    return food;
  }

  moveSnake(): void {
    const currentState = this.gameStateSignal();
    if (currentState.gameOver) return;

    const head = { ...currentState.snake[0] };
    const direction = this.currentDirection();

    switch (direction) {
      case 'UP':
        head.y--;
        break;
      case 'DOWN':
        head.y++;
        break;
      case 'LEFT':
        head.x--;
        break;
      case 'RIGHT':
        head.x++;
        break;
    }

    if (this.isCollision(head)) {
      this.gameStateSignal.update((state) => ({ ...state, gameOver: true }));
      return;
    }

    const newSnake = [head, ...currentState.snake];
    let newScore = currentState.score;
    let newFood = currentState.food;

    if (head.x === currentState.food.x && head.y === currentState.food.y) {
      newScore++;
      newFood = this.generateFood(newSnake);
    } else {
      newSnake.pop();
    }

    this.gameStateSignal.set({
      snake: newSnake,
      food: newFood,
      score: newScore,
      gameOver: false,
    });
  }

  startGame(): void {
    const initialState = {
      snake: [...this.INITIAL_SNAKE],
      food: this.generateFood(this.INITIAL_SNAKE),
      score: 0,
      gameOver: false,
    };
    this.gameStateSignal.set(initialState);
    this.currentDirection.set('UP');
  }

  changeDirection(newDirection: Direction): void {
    const current = this.currentDirection();
    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== current) {
      this.currentDirection.set(newDirection);
    }
  }

  private isCollision(head: Point): boolean {
    if (
      head.x < 0 ||
      head.x >= this.BOARD_SIZE ||
      head.y < 0 ||
      head.y >= this.BOARD_SIZE
    ) {
      return true;
    }

    return this.gameStateSignal().snake.some(
      (segment) => segment.x === head.x && segment.y === head.y
    );
  }
}
