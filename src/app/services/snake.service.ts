import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Position {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root',
})
export class SnakeService {
  private readonly BOARD_SIZE = 20;
  private snake: Position[] = [];
  private food: Position = { x: 0, y: 0 };
  private direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'RIGHT';
  private gameOver = false;
  private score = 0;

  public gameState$ = new BehaviorSubject<{
    snake: Position[];
    food: Position;
    gameOver: boolean;
    score: number;
  }>({ snake: [], food: { x: 0, y: 0 }, gameOver: false, score: 0 });

  constructor() {
    this.initGame();
  }

  initGame() {
    this.snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    this.direction = 'RIGHT';
    this.gameOver = false;
    this.score = 0;
    this.generateFood();
    this.updateGameState();
  }

  private generateFood() {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.BOARD_SIZE),
        y: Math.floor(Math.random() * this.BOARD_SIZE),
      };
    } while (
      this.snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    this.food = newFood;
  }

  moveSnake() {
    if (this.gameOver) return;

    const head = { ...this.snake[0] };

    switch (this.direction) {
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

    // Check for collisions
    if (
      head.x < 0 ||
      head.x >= this.BOARD_SIZE ||
      head.y < 0 ||
      head.y >= this.BOARD_SIZE ||
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      this.gameOver = true;
      this.updateGameState();
      return;
    }

    // Add new head
    this.snake.unshift(head);

    // Check if food is eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
    } else {
      // Remove tail if no food was eaten
      this.snake.pop();
    }

    this.updateGameState();
  }

  changeDirection(newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  private updateGameState() {
    this.gameState$.next({
      snake: [...this.snake],
      food: { ...this.food },
      gameOver: this.gameOver,
      score: this.score,
    });
  }

  getBoardSize() {
    return this.BOARD_SIZE;
  }
}
