import { FENChar } from '../../chess-logic/models';

export type SquareWithPiece = {
  piece: FENChar,
  x: number,
  y: number,
};

export type SquareWithoutPiece = {
  piece: null,
};

export type SelectedSquare = SquareWithPiece | SquareWithoutPiece;
