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
  Empty = ' ',
}
