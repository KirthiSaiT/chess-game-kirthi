const socket = io();

const chess = new Chess();

const boardElement = document.getElementById(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
           const square =  document.createElement("div");
        })
    })
};

const handleMove=()=>{};

const getPieceUnicode = ()=>{};