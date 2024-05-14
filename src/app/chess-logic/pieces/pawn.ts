import { FENChar, Coords, Color } from '../models';
import { Piece } from './piece';

export class Pawn extends Piece {
  private _hasMoved = false;
  protected override _FENChar: FENChar;
  protected override _directions: Coords[] = [
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ];

  constructor(private pieceColor: Color) {
    super(pieceColor);
    this._FENChar = pieceColor === Color.White ? FENChar.WhitePawn : FENChar.BlackPawn;
  }

  public get hasMoved(): boolean {
    return this._hasMoved;
  }

  public set hasMoved(_) {
    this._hasMoved = true;

    this._directions = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
    ];

    if (this.pieceColor === Color.Black) {
      this.setBlackPawnDirections();
    }
  }

  private setBlackPawnDirections() {
    this._directions = this._directions.map((direction) => {
      return { x: direction.x, y: -direction.y };
    });
  }
}
