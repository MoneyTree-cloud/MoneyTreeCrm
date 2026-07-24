import React, { useState, useEffect } from "react";
import "./puzzle.css";
import PageContent from '../../components/Common/PageContent'

// Import all images
import img1 from "../../assets/images/Games/1.jpg";
import img2 from "../../assets/images/Games/2.jpg";
import img3 from "../../assets/images/Games/3.jpg";
import img4 from "../../assets/images/Games/4.jpg";
import img5 from "../../assets/images/Games/5.jpg";
import img6 from "../../assets/images/Games/6.jpg";
import img7 from "../../assets/images/Games/7.jpg";
import img8 from "../../assets/images/Games/8.jpg";
import img9 from "../../assets/images/Games/9.jpg";

// Image mapping
const imgMap = {
  "1": img1,
  "2": img2,
  "3": img3,
  "4": img4,
  "5": img5,
  "6": img6,
  "7": img7,
  "8": img8,
  "9": img9,
};

const rows = 3;
const columns = 3;
const initialOrder = ["4", "2", "8", "5", "1", "6", "7", "9", "3"];

const Puzzle = () => {
  const [tiles, setTiles] = useState([]);
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    // Initialize tiles on mount
    const initTiles = [];
    let counter = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        initTiles.push({
          id: `${r}-${c}`,
          imgId: initialOrder[counter],
          src: imgMap[initialOrder[counter]],
          row: r,
          col: c,
        });
        counter++;
      }
    }
    setTiles(initTiles);
  }, []);

  const handleTileClick = (clickedTile) => {
    // Find the current "blank" tile (imgId === "9")
    const blankTile = tiles.find(tile => tile.imgId === "9");

    // Check if the clicked tile is adjacent to the blank tile
    if (isAdjacent(clickedTile, blankTile)) {
      // Swap the clicked tile with the blank tile
      const newTiles = tiles.map((tile) => {
        if (tile.id === clickedTile.id) return { ...tile, imgId: blankTile.imgId, src: blankTile.src };
        if (tile.id === blankTile.id) return { ...tile, imgId: clickedTile.imgId, src: clickedTile.src };
        return tile;
      });

      setTiles(newTiles);
      setTurns(turns + 1);
    }
  };

  const isAdjacent = (tile1, tile2) => {
    const [r1, c1] = tile1.id.split("-").map(Number);
    const [r2, c2] = tile2.id.split("-").map(Number);

    // Check if the tiles are adjacent (horizontal or vertical)
    return (
      (r1 === r2 && Math.abs(c1 - c2) === 1) || // Same row, adjacent columns
      (c1 === c2 && Math.abs(r1 - r2) === 1)    // Same column, adjacent rows
    );
  };

  return (
    <PageContent>
      <div className="puzzle-container">
        <h1>Slide Puzzle</h1>
        <div id="board" className="board">
          {tiles.map((tile) => (
            <img
              key={tile.id}
              src={tile.src}
              alt={`tile-${tile.imgId}`}
              onClick={() => handleTileClick(tile)} // Handle click to swap
              className="tile"
            />
          ))}
        </div>
        <h2>Turns: {turns}</h2>
      </div>
    </PageContent>
  );
};

export default Puzzle;
