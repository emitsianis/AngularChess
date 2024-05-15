import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { CommonModule } from '@angular/common';
import { Coords, pieceImagePath } from '../../chess-logic/models'; // Removed unused FENChar import
import { SelectedSquare } from './models';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent {
  private chessBoard = new ChessBoard();
  public chessBoardView = this.chessBoard.chessBoardView;
  public pieceImagePath = pieceImagePath;
  private selectedSquare: SelectedSquare = { piece: null };
  private pieceSafeSquares: Coords[] = [];

  public get currentPlayer() {
    return this.chessBoard.playerColor;
  }

  public get safeSquares() {
    return this.chessBoard.safeSquares;
  }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    return !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }

  public selectingPiece(x: number, y: number): void {
    const piece = this.chessBoardView[x][y];
    if (!piece) return;

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(`${x},${y}`) || [];
  }
}
