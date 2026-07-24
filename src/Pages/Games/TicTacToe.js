import React, { useState } from "react";
import "./TicTacToe.css";
import PageContent from "../../components/Common/PageContent";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);

  const winner = calculateWinner(board);

  const handleClick = (index) => {
    if (board[index] || winner) return; // Ignore if occupied or game over
    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const line = calculateWinningLine(newBoard);
    setWinningLine(line || []);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
  };

  const renderSquare = (index) => (
    <button className="square" onClick={() => handleClick(index)}>
      {board[index]}
    </button>
  );

  const status = winner
    ? `Winner: ${winner}`
    : board.every(Boolean)
    ? "Draw"
    : `Next Player: ${isXNext ? "X" : "O"}`;

  return (
    <PageContent>
      <div className="tic-tac-toe-container">
        <h1>Tic Tac Toe</h1>
        <div className="status">{status}</div>
        <div className="board">
          {board.map((_, i) => renderSquare(i))}
          {winningLine.length > 0 && <WinningLine line={winningLine} />}
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset Game
        </button>
      </div>
    </PageContent>
  );
};

// Helper: check winner
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

// Helper: get winning line
function calculateWinningLine(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

// Component to draw winning line
const WinningLine = ({ line }) => {
  // Calculate positions of the winning line (Horizontal, Vertical, Diagonal)
  const positions = [
    { top: "16.5%", left: "0%", width: "100%", height: "5px", transform: "scaleX(0)" }, // top row
    { top: "50%", left: "0%", width: "100%", height: "5px", transform: "scaleX(0)" },   // middle row
    { top: "83.5%", left: "0%", width: "100%", height: "5px", transform: "scaleX(0)" }, // bottom row
    { top: "0%", left: "16.5%", width: "5px", height: "100%", transform: "scaleY(0)" }, // left col
    { top: "0%", left: "50%", width: "5px", height: "100%", transform: "scaleY(0)" },   // middle col
    { top: "0%", left: "83.5%", width: "5px", height: "100%", transform: "scaleY(0)" }, // right col
    { top: "0%", left: "0%", width: "100%", height: "5px", transform: "rotate(45deg) scaleX(0)", transformOrigin: "top left" }, // diagonal \
    { top: "0%", left: "0%", width: "100%", height: "5px", transform: "rotate(-45deg) scaleX(0)", transformOrigin: "top right" } // diagonal /
  ];

  // Mapping for the winning line index
  const lineStr = line.join("");

  let style = {};
  if (lineStr === "012") style = positions[0];
  else if (lineStr === "345") style = positions[1];
  else if (lineStr === "678") style = positions[2];
  else if (lineStr === "036") style = positions[3];
  else if (lineStr === "147") style = positions[4];
  else if (lineStr === "258") style = positions[5];
  else if (lineStr === "048") style = positions[6];
  else if (lineStr === "246") style = positions[7];

  return <div className="winning-line" style={style}></div>;
};

export default TicTacToe;
