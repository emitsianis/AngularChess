import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { CommonModule } from '@angular/common';
import { pieceImagePath } from '../../chess-logic/models';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss',
})
export class ChessBoardComponent {
  private chessBoard = new ChessBoard();
  public chessBoardView = this.chessBoard.chessBoardView;
  public pieceImagePath = pieceImagePath;

  public get currentPlayer() {
    return this.chessBoard.playerColor;
  }

  public isSquareDark(x: number, y: number) {
    return ChessBoard.isSquareDark(x, y);
  }
}
