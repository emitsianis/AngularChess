import { Piece } from './pieces/piece';
import { Color, Coords, FENChar, SafeSquares } from './models';
import { Rook } from './pieces/rook';
import { Knight } from './pieces/knight';
import { Bishop } from './pieces/bishop';
import { Queen } from './pieces/queen';
import { King } from './pieces/king';
import { Pawn } from './pieces/pawn';

export class ChessBoard {
  private chessBoard: (Piece | null)[][];
  private readonly chessBoardSize = 8;
  private _playerColor = Color.White;

  constructor() {
    this.chessBoard = [
      [
        new Rook(Color.White),
        new Knight(Color.White),
        new Bishop(Color.White),
        new Queen(Color.White),
        new King(Color.White),
        new Bishop(Color.White),
        new Knight(Color.White),
        new Rook(Color.White),
      ],
      [
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
      ],
      [
        new Rook(Color.Black),
        new Knight(Color.Black),
        new Bishop(Color.Black),
        new Queen(Color.Black),
        new King(Color.Black),
        new Bishop(Color.Black),
        new Knight(Color.Black),
        new Rook(Color.Black),
      ],
    ];
  }

  public static isSquareDark(x: number, y: number): boolean {
    return (x + y) % 2 === 1;
  }

  public get playerColor(): Color {
    return this._playerColor;
  }

  public get chessBoardView(): (FENChar | null)[][] {
    return this.chessBoard.map((row) => {
      return row.map((piece) => piece instanceof Piece ? piece.FENChar : null);
    });
  }

  private areCoordsValid(x: number, y: number): boolean {
    return x >= 0 && x < this.chessBoardSize && y >= 0 && y < this.chessBoardSize;
  }

  public isInCheck(playerColor: Color): boolean {
    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece = this.chessBoard[x][y];
        if (!piece || piece.color !== playerColor) continue;

        for (const { x: dx, y: dy } of piece.directions) {
          let newX = x + dx;
          let newY = y + dy;

          if (!this.areCoordsValid(newX, newY)) continue;

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (piece instanceof Pawn && dy === 0) continue;
            const attackedPiece = this.chessBoard[newX][newY];
            if (attackedPiece instanceof King && attackedPiece.color !== playerColor) return true;
          } else {
            while (this.areCoordsValid(newX, newY)) {
              const attackedPiece = this.chessBoard[newX][newY];
              if (attackedPiece instanceof King && attackedPiece.color !== playerColor) return true;

              if (attackedPiece) break;

              newX += dx;
              newY += dy;
            }
          }
        }
      }
    }

    return false;
  }

  private isPositionSafeAfterMove(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): boolean {
    const newPiece = this.chessBoard[newX][newY];

    if (newPiece?.color === piece.color) return false;

    // Simulate position
    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;

    const isPositionSafe = !this.isInCheck(piece.color);

    this.chessBoard[prevX][prevY] = piece;
    this.chessBoard[newX][newY] = newPiece;

    return isPositionSafe;
  }

  private findSafeSquares(): SafeSquares {
    const safeSquares: SafeSquares = new Map<string, Coords[]>();

    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece = this.chessBoard[x][y];
        if (!piece || piece.color !== this.playerColor) continue;

        const pieceSafeSquares: Coords[] = [];

        for (const { x: dx, y: dy } of piece.directions) {
          let newX = x + dx;
          let newY = y + dy;

          if (!this.areCoordsValid(newX, newY)) continue;

          let newPiece = this.chessBoard[newX][newY];
          if (newPiece?.color === piece.color) continue;

          if (piece instanceof Pawn) {
            if (dx === 2 || dx === -2) {
              if (newPiece) continue;
              // If there is a piece 2 squares ahead, the pawn can't move there
              if (this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY]) continue;
            }

            // If there is a piece 1 square ahead, the pawn can't move there
            if ((dx === 1 || dx === -1) && dy === 0 && newPiece) continue;

            // If there is a piece diagonally ahead, the pawn can move there only if it's an enemy piece
            if ((dx === 1 || dx === -1) && (!newPiece || piece.color === newPiece.color)) continue;
          }

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (this.isPositionSafeAfterMove(piece, x, y, newX, newY)) {
              pieceSafeSquares.push({ x: newX, y: newY });
            }
          } else {
            while (this.areCoordsValid(newX, newY)) {
              newPiece = this.chessBoard[newX][newY];
              if (newPiece?.color === piece.color) break;

              if (this.isPositionSafeAfterMove(piece, x, y, newX, newY)) {
                pieceSafeSquares.push({ x: newX, y: newY });
              }

              if (newPiece) break;

              newX += dx;
              newY += dy;
            }
          }
        }

        if (pieceSafeSquares.length) {
          safeSquares.set(`${x},${y}`, pieceSafeSquares);
        }
      }
    }

    return safeSquares;
  }
}
