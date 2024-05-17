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
  public isPromotionActive = false;
  private promotionCoords: Coords | null = null;
  private promotedPiece: FENChar | null = null;
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

  public get gameOverMessage(): string | undefined {
    return this.chessBoard.gameOverMessage;
  }

  public get safeSquares() {
    return this.chessBoard.safeSquares;
  }

  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White ? [
      FENChar.WhiteBishop, FENChar.WhiteKnight, FENChar.WhiteQueen, FENChar.WhiteRook,
    ] : [
      FENChar.BlackBishop, FENChar.BlackKnight, FENChar.BlackQueen, FENChar.BlackRook,
    ];
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

  public promotePiece(piece: FENChar): void {
    if (!this.promotionCoords || !this.selectedSquare.piece) return;

    this.promotedPiece = piece;
    const { x: newX, y: newY } = this.promotionCoords;
    const { x: prevX, y: prevY } = this.selectedSquare;

    this.updateBoard(prevX, prevY, newX, newY);
  }

  public closePawnPromotionDialog(): void {
    this.unmarkSquares();
  }

  public isSquarePromotionSquare(x: number, y: number): boolean {
    if (!this.promotionCoords) return false;
    return this.promotionCoords.x === x && this.promotionCoords.y === y;
  }

  private selectingPiece(x: number, y: number): void {
    if (this.gameOverMessage !== undefined) return;

    const piece = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked = this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmarkSquares();

    if (isSameSquareClicked) {
      this.unmarkSquares();
      return;
    }

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(`${x},${y}`) || [];
  }

  private updateBoard(prevX: number, prevY: number, newX: number, newY: number): void {
    this.chessBoard.move(prevX, prevY, newX, newY, this.promotedPiece);
    this.checkState = this.chessBoard.checkState;
    this.lastMove = this.chessBoard.lastMove;
    this.chessBoardView = this.chessBoard.chessBoardView;

    this.unmarkSquares();
  }

  private unmarkSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];

    if (this.isPromotionActive) {
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }

  private placingPiece(newX: number, newY: number): void {
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    const isPawnSelected = [FENChar.WhitePawn, FENChar.BlackPawn].includes(this.selectedSquare.piece);
    const isPawnOnLastRank = isPawnSelected && (newX === 0 || newX === 7);
    const shouldOpenPromotionDialogue = isPawnOnLastRank && !this.isPromotionActive;

    if (shouldOpenPromotionDialogue) {
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = { x: newX, y: newY };
      return;
    }

    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected = piece === piece.toUpperCase();

    return isWhitePieceSelected && this.playerColor === Color.Black || !isWhitePieceSelected && this.playerColor === Color.White;

  }
}
