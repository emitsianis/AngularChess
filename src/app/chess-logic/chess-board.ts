import { CheckState, Color, Coords, FENChar, LastMove, SafeSquares } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { FENConverter } from './FENConverter';

export class ChessBoard {
  private chessBoard: (Piece | null)[][];
  private readonly chessBoardSize: number = 8;
  private _playerColor = Color.White;
  private _safeSquares: SafeSquares;
  private _lastMove: LastMove | undefined;
  private _checkState: CheckState = { isInCheck: false };
  private _isGameOver = false;
  private _gameOverMessage: string | undefined;
  private fiftyMoveRuleCounter = 0;
  private fullNumberOfMovesCounter = 1;
  private threeFoldRePetitionDictionary = new Map<string, number>();
  private threeFoldRepetitionFlag = false;
  private _boardAsFEN: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  private FENConverter = new FENConverter();

  constructor() {
    this.chessBoard = [
      [
        new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
        new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White),
      ],
      [
        new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
        new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
        new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
      ],
      [
        new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
        new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black),
      ],
    ];
    this._safeSquares = this.findSafeSquares();
  }

  public get playerColor(): Color {
    return this._playerColor;
  }

  public get chessBoardView(): (FENChar | null)[][] {
    return this.chessBoard.map(row => {
      return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
    });
  }

  public get safeSquares(): SafeSquares {
    return this._safeSquares;
  }

  public get lastMove(): LastMove | undefined {
    return this._lastMove;
  }

  public get checkState(): CheckState {
    return this._checkState;
  }

  public get isGameOver(): boolean {
    return this._isGameOver;
  }

  public get gameOverMessage(): string | undefined {
    return this._gameOverMessage;
  }

  public get boardAsFEN(): string {
    return this._boardAsFEN;
  }

  public static isSquareDark(x: number, y: number): boolean {
    return (x + y) % 2 === 1;
  }

  public isInCheck(playerColor: Color, checkingCurrentPosition: boolean): boolean {
    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece = this.chessBoard[x][y];
        if (!piece || piece.color === playerColor) continue;

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (!this.areCoordsValid(newX, newY)) continue;

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (piece instanceof Pawn && dy === 0) continue;

            const attackedPiece = this.chessBoard[newX][newY];
            if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
              if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
              return true;
            }
          } else {
            while (this.areCoordsValid(newX, newY)) {
              const attackedPiece = this.chessBoard[newX][newY];
              if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                return true;
              }

              if (attackedPiece !== null) break;

              newX += dx;
              newY += dy;
            }
          }
        }
      }
    }

    if (checkingCurrentPosition) this._checkState = { isInCheck: false };
    return false;
  }

  public move(prevX: number, prevY: number, newX: number, newY: number, promotedPieceType: FENChar | null): void {
    if (this.isGameOver) throw new Error("Game is over");

    if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY)) return;

    const piece = this.chessBoard[prevX][prevY];
    if (piece?.color !== this.playerColor) return;

    const pieceSafeSquares = this.safeSquares.get(`${prevX},${prevY}`);
    if (!pieceSafeSquares?.find((coords) => coords.x === newX && coords.y === newY)) {
      throw new Error("Invalid move");
    }

    if (piece instanceof Pawn || piece instanceof King || piece instanceof Rook) piece.hasMoved = true;

    const isPieceTaken = this.chessBoard[newX][newY] !== null;

    if (isPieceTaken || piece instanceof Pawn) {
      this.fiftyMoveRuleCounter = 0;
    } else {
      this.fiftyMoveRuleCounter += 0.5;
    }

    this.handlingSpecialMoves(piece, prevX, prevY, newX, newY);

    if (promotedPieceType) {
      this.chessBoard[newX][newY] = this.promotedPiece(promotedPieceType);
    } else {
      this.chessBoard[newX][newY] = piece;
    }

    this.chessBoard[prevX][prevY] = null;

    this._lastMove = { prevX, prevY, currX: newX, currY: newY, piece };
    this._playerColor = this.playerColor === Color.White ? Color.Black : Color.White;
    this.isInCheck(this.playerColor, true);
    this._safeSquares = this.findSafeSquares();

    if (this.playerColor === Color.White) this.fullNumberOfMovesCounter++;

    this._boardAsFEN = this.FENConverter.convertBoardToFEN(this.chessBoard, this.playerColor, this.lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMovesCounter);
    this.updateThreeFoldRepetitionDictionary(this.boardAsFEN);

    this._isGameOver = this.isGameFinished();
  };

  private isPositionSafeAfterMove(prevX: number, prevY: number, newX: number, newY: number): boolean {
    const piece = this.chessBoard[prevX][prevY];
    if (!piece) return false;

    const newPiece = this.chessBoard[newX][newY];
    if (newPiece && newPiece.color === piece.color) return false;

    // simulate position
    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;

    const isPositionSafe: boolean = !this.isInCheck(piece.color, false);

    this.chessBoard[prevX][prevY] = piece;
    this.chessBoard[newX][newY] = newPiece;

    return isPositionSafe;
  }

  private areCoordsValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.chessBoardSize && y < this.chessBoardSize;
  }

  private findSafeSquares(): SafeSquares {
    const safeSquares: SafeSquares = new Map<string, Coords[]>();

    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece = this.chessBoard[x][y];
        if (piece?.color !== this.playerColor) continue;

        const pieceSafeSquares: Coords[] = [];

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (!this.areCoordsValid(newX, newY)) continue;

          let newPiece = this.chessBoard[newX][newY];
          if (newPiece && newPiece.color === piece.color) continue;

          if (piece instanceof Pawn) {
            // cant move pawn two squares straight if there is piece in front of it
            if (dx === 2 || dx === -2) {
              if (newPiece) continue;
              if (this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY]) continue;
            }

            // cant move pawn one square straight if piece is in front of it
            if ((dx === 1 || dx === -1) && dy === 0 && newPiece) continue;

            // cant move pawn diagonally if there is no piece, or piece has same color as pawn
            if ((dy === 1 || dy === -1) && (!newPiece || piece.color === newPiece.color)) continue;
          }

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (this.isPositionSafeAfterMove(x, y, newX, newY))
              pieceSafeSquares.push({ x: newX, y: newY });
          } else {
            while (this.areCoordsValid(newX, newY)) {
              newPiece = this.chessBoard[newX][newY];
              if (newPiece && newPiece.color === piece.color) break;

              if (this.isPositionSafeAfterMove(x, y, newX, newY))
                pieceSafeSquares.push({ x: newX, y: newY });

              if (newPiece !== null) break;

              newX += dx;
              newY += dy;
            }
          }
        }

        if (piece instanceof King) {
          if (this.canCastle(piece, true)) pieceSafeSquares.push({ x, y: 6 });
          if (this.canCastle(piece, false)) pieceSafeSquares.push({ x, y: 2 });
        } else if (piece instanceof Pawn && this.canCaptureEnPassant(piece, x, y)) {
          pieceSafeSquares.push({ x: x + (piece.color === Color.White ? 1 : -1), y: this.lastMove!.currY });
        }

        if (pieceSafeSquares.length)
          safeSquares.set(x + "," + y, pieceSafeSquares);
      }
    }

    return safeSquares;
  }

  private canCastle(king: King, kingSideCastle: boolean): boolean {
    if (king.hasMoved) return false;

    const kingPositionX = king.color === Color.White ? 0 : 7;
    const kingPositionY = 4;

    const rookPositionX = kingPositionX;
    const rookPositionY = kingSideCastle ? 7 : 0;

    const rook = this.chessBoard[rookPositionX][rookPositionY];
    if (!(rook instanceof Rook) || rook.hasMoved || this.checkState.isInCheck) return false;

    const firstNextKingPositionY = kingPositionY + (kingSideCastle ? 1 : -1);
    const secondNextKingPositionY = kingPositionY + (kingSideCastle ? 2 : -2);

    if (this.chessBoard[kingPositionX][firstNextKingPositionY] || this.chessBoard[kingPositionX][secondNextKingPositionY]) return false;

    if (!kingSideCastle && this.chessBoard[kingPositionX][1]) return false;

    return this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY)
      && this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY);
  }

  private canCaptureEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
    if (!this.lastMove) return false;

    const { prevX, prevY, currX, currY, piece } = this.lastMove;
    if (
      !(piece instanceof Pawn)
      || pawn.color !== this.playerColor
      || Math.abs(currX - prevX) !== 2
      || pawnX !== currX
      || Math.abs(pawnY - currY) !== 1
    ) return false;

    const pawnNewPositionX = pawnX + (pawn.color === Color.White ? 1 : -1);
    const pawnNewPositionY = currY;

    this.chessBoard[currX][currY] = null;
    const isPositionSafe = this.isPositionSafeAfterMove(pawnX, pawnY, pawnNewPositionX, pawnNewPositionY);
    this.chessBoard[currX][currY] = piece;

    return isPositionSafe;
  }

  private handlingSpecialMoves(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): void {
    if (piece instanceof King && Math.abs(prevY - newY) === 2) {
      const isKingSideCastle = newY > prevY;

      const rookPositionX = prevX;
      const rookPositionY = isKingSideCastle ? 7 : 0;

      const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook;
      const rookNewPositionY = isKingSideCastle ? 5 : 3;

      this.chessBoard[rookPositionX][rookPositionY] = null;
      this.chessBoard[rookPositionX][rookNewPositionY] = rook;
      rook.hasMoved = true;
    } else if (
      piece instanceof Pawn
      && this.lastMove
      && this.lastMove.piece instanceof Pawn
      && Math.abs(this.lastMove.currX - this.lastMove.prevX) === 2
      && prevX === this.lastMove.currX
      && newY === this.lastMove.currY
    ) {
      this.chessBoard[this.lastMove.currX][this.lastMove.currY] = null;
    }
  }

  private promotedPiece(promotedPieceType: FENChar): Knight | Bishop | Rook | Queen {
    if ([FENChar.WhiteKnight, FENChar.BlackKnight].includes(promotedPieceType)) return new Knight(this.playerColor);
    if ([FENChar.WhiteBishop, FENChar.BlackBishop].includes(promotedPieceType)) return new Bishop(this.playerColor);
    if ([FENChar.WhiteRook, FENChar.BlackRook].includes(promotedPieceType)) return new Rook(this.playerColor);
    if ([FENChar.WhiteQueen, FENChar.BlackQueen].includes(promotedPieceType)) return new Queen(this.playerColor);
    return new Queen(this.playerColor);
  }

  private isGameFinished(): boolean {
    if (this.insufficientMaterial()) {
      this._gameOverMessage = "Draw by insufficient material";
      return true;
    }

    if (!this.safeSquares.size) {
      if (this.checkState.isInCheck) {
        const prevPlayer = this.playerColor === Color.White ? Color.Black : Color.White;
        this._gameOverMessage = `Checkmate! ${prevPlayer} wins!`;
      } else {
        this._gameOverMessage = "Stalemate ";
      }

      return true;
    }

    if (this.threeFoldRepetitionFlag) {
      this._gameOverMessage = "Draw by threefold repetition";
      return true;
    }

    if (this.fiftyMoveRuleCounter >= 50) {
      this._gameOverMessage = "Draw by fifty-move rule";
      return true;
    }

    return false;
  }

  private playerHasOnlyTwoKnightsAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
    return pieces.filter(piece => piece.piece instanceof Knight).length === 2;
  }

  private playerHasOnlyBishopsWithSameColorAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
    const bishops = pieces.filter(piece => piece.piece instanceof Bishop);
    const areAllBishopsOfSameColor = new Set(bishops.map(bishop => ChessBoard.isSquareDark(bishop.x, bishop.y))).size === 1;
    return bishops.length === pieces.length - 1 && areAllBishopsOfSameColor;
  }

  private insufficientMaterial(): boolean {
    const whitePieces: { piece: Piece, x: number, y: number }[] = [];
    const blackPieces: { piece: Piece, x: number, y: number }[] = [];

    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece: Piece | null = this.chessBoard[x][y];
        if (!piece) continue;

        if (piece.color === Color.White) whitePieces.push({ piece, x, y });
        else blackPieces.push({ piece, x, y });
      }
    }

    // King vs King
    if (whitePieces.length === 1 && blackPieces.length === 1)
      return true;

    // King and Minor Piece vs King
    if (whitePieces.length === 1 && blackPieces.length === 2)
      return blackPieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

    else if (whitePieces.length === 2 && blackPieces.length === 1)
      return whitePieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

    // both sides have bishop of same color
    else if (whitePieces.length === 2 && blackPieces.length === 2) {
      const whiteBishop = whitePieces.find(piece => piece.piece instanceof Bishop);
      const blackBishop = blackPieces.find(piece => piece.piece instanceof Bishop);

      if (whiteBishop && blackBishop) {
        return ChessBoard.isSquareDark(whiteBishop.x, whiteBishop.y) && ChessBoard.isSquareDark(blackBishop.x, blackBishop.y) || !ChessBoard.isSquareDark(whiteBishop.x, whiteBishop.y) && !ChessBoard.isSquareDark(blackBishop.x, blackBishop.y);
      }
    }

    if (whitePieces.length === 3 && blackPieces.length === 1 && this.playerHasOnlyTwoKnightsAndKing(whitePieces) ||
      whitePieces.length === 1 && blackPieces.length === 3 && this.playerHasOnlyTwoKnightsAndKing(blackPieces)
    ) return true;

    if (whitePieces.length >= 3 && blackPieces.length === 1 && this.playerHasOnlyBishopsWithSameColorAndKing(whitePieces) ||
      whitePieces.length === 1 && blackPieces.length >= 3 && this.playerHasOnlyBishopsWithSameColorAndKing(blackPieces)
    ) return true;

    return false;
  }

  private updateThreeFoldRepetitionDictionary(FEN: string): void {
    const threeFoldRepetitionFENKey = FEN.split(" ").slice(0, 4).join("");
    const threeFoldRepetitionValue = this.threeFoldRePetitionDictionary.get(threeFoldRepetitionFENKey);

    if (!threeFoldRepetitionValue) {
      this.threeFoldRePetitionDictionary.set(threeFoldRepetitionFENKey, 1);
    } else {
      if (threeFoldRepetitionValue === 2) {
        this.threeFoldRepetitionFlag = true;
        return;
      }
      this.threeFoldRePetitionDictionary.set(threeFoldRepetitionFENKey, 2);
    }
  }
}
