import { Color, FENChar, Coords } from '../models';

export abstract class Piece {
  protected abstract _FENChar: FENChar;
  protected abstract _directions: Coords[];

  constructor(
    private color: Color,
  ) {
  }

  public get FENChar(): FENChar {
    return this._FENChar;
  }

  public get directions(): Coords[] {
    return this._directions;
  }

  public getColor(): Color {
    return this.color;
  }
}
