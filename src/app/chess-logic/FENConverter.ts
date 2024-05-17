import { Piece } from './pieces/piece';
import { Color, columns, LastMove } from './models';
import { King } from './pieces/king';
import { Rook } from './pieces/rook';
import { Pawn } from './pieces/pawn';

export class FENConverter {
  public convertBoardToFEN(
    board: (Piece | null)[][],
    playerColor: Color,
    lastMove: LastMove | undefined,
    fiftyMoveRuleCounter: number,
    numberOfFullMoves: number,
  ): string {
    let FEN = '';

    for (let i = 7; i >= 0; i--) {
      let FENRow = '';
      let consecutiveEmptySquares = 0;

      for (const piece of board[i]) {
        if (!piece) {
          consecutiveEmptySquares++;
          continue;
        }

        if (consecutiveEmptySquares !== 0) {
          FENRow += consecutiveEmptySquares;
        }

        consecutiveEmptySquares = 0;
        FENRow += piece.FENChar;
      }

      if (consecutiveEmptySquares !== 0) {
        FENRow += consecutiveEmptySquares;
      }

      FEN += (i === 0) ? FENRow : FENRow + '/';
    }

    const player = playerColor === Color.White ? 'w' : 'b';

    FEN += ` ${player}`;
    FEN += ` ${this.castlingAvailability(board)}`;
    FEN += ` ${this.enPassantPossibility(lastMove, playerColor)}`;
    FEN += ` ${fiftyMoveRuleCounter * 2}`;
    FEN += ` ${numberOfFullMoves}`;
    return FEN;
  }

  private castlingAvailability(board: (Piece | null)[][]): string {
    const castlingPossibilities = (color: Color): string => {
      let castlingAvailability = '';

      const kingPositionX = color === Color.White ? 0 : 7;
      const king = board[kingPositionX][4];

      if (king instanceof King && !king.hasMoved) {
        const rookPositionX = kingPositionX;
        const kingSideRook = board[rookPositionX][7];
        const queenSideRook = board[rookPositionX][0];

        if (kingSideRook instanceof Rook && !kingSideRook.hasMoved) {
          castlingAvailability += 'k';
        }

        if (queenSideRook instanceof Rook && !queenSideRook.hasMoved) {
          castlingAvailability += 'q';
        }

        if (color === Color.White) {
          castlingAvailability = castlingAvailability.toUpperCase();
        }
      }
      return castlingAvailability;
    };

    const availability = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
    return availability !== "" ? availability : "-";
  }

  private enPassantPossibility(lastMove: LastMove | undefined, color: Color): string {
    if (!lastMove) {
      return '-';
    }

    const { piece, currX: newX, prevX, prevY } = lastMove;

    if (piece instanceof Pawn && Math.abs(prevX - newX) === 2) {
      const row = color === Color.White ? 6 : 3;
      return columns[prevY] + row;
    }

    return '-';
  }
}
