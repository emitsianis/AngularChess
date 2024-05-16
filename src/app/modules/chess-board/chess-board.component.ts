import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { CommonModule } from '@angular/common';
import { Color, Coords, FENChar, pieceImagePath } from '../../chess-logic/models'; // Removed unused FENChar import
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
  private lastMove = this.chessBoard.lastMove;
  private checkState = this.chessBoard.checkState;

  public get playerColor(): Color {
    return this.chessBoard.playerColor;
  }

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
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked = this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    if (isSameSquareClicked) {
      this.unmarkSquares();
      return;
    }

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(`${x},${y}`) || [];
  }

  public move(x: number, y: number): void {
    this.selectingPiece(x, y);
    this.placingPiece(x, y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) return false;

    const { prevX, prevY, currX, currY } = this.lastMove;
    return prevX === x && prevY === y || currX === x && currY === y;
  }

  public isSquareChecked(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  private unmarkSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];
  }

  private placingPiece(newX: number, newY: number): void {
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    const { x: prevX, y: prevY } = this.selectedSquare;
    this.chessBoard.move(prevX, prevY, newX, newY);
    this.checkState = this.chessBoard.checkState;
    this.lastMove = this.chessBoard.lastMove;
    this.chessBoardView = this.chessBoard.chessBoardView;

    this.unmarkSquares();
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected = piece === piece.toUpperCase();

    return isWhitePieceSelected && this.playerColor === Color.Black || !isWhitePieceSelected && this.playerColor === Color.White;

  }
}
