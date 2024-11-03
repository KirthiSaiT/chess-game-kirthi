const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                // Drag Start Event
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                // Drag End Event
                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            // Allow dropping
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            // Handle Drop Event
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    // Handle move only if it's not the same square
                    if (sourceSquare.row !== targetSquare.row || sourceSquare.col !== targetSquare.col) {
                        handleMove(sourceSquare, targetSquare);
                    }
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' // promote to queen if applicable
    };

    // Attempt to make the move
    const legalMove = chess.move(move);
    if (legalMove) {
        // Emit move to server
        socket.emit("move", move);
    } else {
        alert("Invalid move!");
    }

    // Re-render the board after move attempt
    renderBoard();
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'p': '♟', // Black Pawn
        'r': '♜', // Black Rook
        'n': '♞', // Black Knight
        'b': '♝', // Black Bishop
        'q': '♛', // Black Queen
        'k': '♚', // Black King
        'P': '♙', // White Pawn
        'R': '♖', // White Rook
        'N': '♘', // White Knight
        'B': '♗', // White Bishop
        'Q': '♕', // White Queen
        'K': '♔'  // White King
    };
    return unicodePieces[piece.type] || "";
};

// Socket event handlers
socket.on("playerRole", function(role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function() {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move) {
    chess.move(move);
    renderBoard();
});

// Initialize the board
renderBoard();
