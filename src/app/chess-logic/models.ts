import { Piece } from './pieces/piece';

export enum Color {
  White,
  Black,
}

export type Coords = {
  x: number,
  y: number,
}

export enum FENChar {
  WhiteKing = 'K',
  WhiteQueen = 'Q',
  WhiteRook = 'R',
  WhiteBishop = 'B',
  WhiteKnight = 'N',
  WhitePawn = 'P',
  BlackKing = 'k',
  BlackQueen = 'q',
  BlackRook = 'r',
  BlackBishop = 'b',
  BlackKnight = 'n',
  BlackPawn = 'p',
}

export const pieceImagePath: Readonly<Record<FENChar, string>> = {
  [FENChar.WhiteKing]: 'assets/pieces/white-king.svg',
  [FENChar.WhiteQueen]: 'assets/pieces/white-queen.svg',
  [FENChar.WhiteRook]: 'assets/pieces/white-rook.svg',
  [FENChar.WhiteBishop]: 'assets/pieces/white-bishop.svg',
  [FENChar.WhiteKnight]: 'assets/pieces/white-knight.svg',
  [FENChar.WhitePawn]: 'assets/pieces/white-pawn.svg',
  [FENChar.BlackKing]: 'assets/pieces/black-king.svg',
  [FENChar.BlackQueen]: 'assets/pieces/black-queen.svg',
  [FENChar.BlackRook]: 'assets/pieces/black-rook.svg',
  [FENChar.BlackBishop]: 'assets/pieces/black-bishop.svg',
  [FENChar.BlackKnight]: 'assets/pieces/black-knight.svg',
  [FENChar.BlackPawn]: 'assets/pieces/black-pawn.svg',
};

export type SafeSquares = Map<string, Coords[]>;

export type LastMove = {
  piece: Piece,
  prevX: number,
  prevY: number,
  currX: number,
  currY: number,
}

type KingChecked = {
  isInCheck: true,
  x: number,
  y: number,
}

type KingNotChecked = {
  isInCheck: false,
}

export type CheckState = KingChecked | KingNotChecked;
