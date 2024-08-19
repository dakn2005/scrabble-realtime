<script>
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { toast } from "svelte-sonner";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";
  import SideBottomMenu from "./SideBottomMenu.svelte";
  import Queue from "$lib/queue.js";
  import { socket, userStore } from "$lib/stores.js";

  let { username, game } = $userStore;

  let toggleSideBar = false;

  // let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  let lettersScores = {
    1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    2: ["D", "G"],
    3: ["B", "C", "M", "P"],
    4: ["F", "H", "V", "W", "Y"],
    5: ["K"],
    8: ["J", "X"],
    10: ["Q", "Z"],
  };

  let lettersDistribution = {
    1: ["J", "K", "Q", "X", "Z"],
    2: ["B", "C", "F", "H", "M", "P", "V", "W", "Y"],
    3: ["G"],
    4: ["D", "L", "S", "U"],
    6: ["N", "R", "T"],
    8: ["O"],
    9: ["A", "I"],
    12: ["E"],
  };

  let directtions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let items = [];

  function getLetterScore(letter) {
    for (const [key, value] of Object.entries(lettersScores)) {
      if (value.includes(letter)) {
        return parseInt(key);
      }
    }
  }

  items = [
    { id: 1, letter: "M" },
    { id: 2, letter: "B" },
    { id: 3, letter: "O" },
    { id: 4, letter: "G" },
    { id: 5, letter: "I" },
    { id: 6, letter: "D" },
    { id: 7, letter: "I" },
  ];

  function handleDnd(e) {
    items = e.detail.items;
  }

  let queue = new Queue();
  let visited = new Set();
  let visitedvisited = new Set();
  let newlyVisited = new Set();
  let wordmap = new Map();
  let wholeWordScores = [];
  let proposedWordScore = 0;
  let newlySubbmittedWord = [
    // { id: 1, letter: "M" },
    // { id: 2, letter: "B" },
    // { id: 3, letter: "O" },
  ];

  function proposedWordQueue(letter, position, score) {
    // console.log(letter, position, score);
    queue.enqueue([letter, position]);
    // console.log(queue.printArray);

    newlyVisited.add(position);

    proposedWordScore += getLetterScore(letter);

    if (score[0] > 1) {
      if (score[1] == "tw" || score[1] == "dw" || score[1] == "m") wholeWordScores.push(score[0]);
      else if (score[1] == "dl" || score[1] == "tl") proposedWordScore *= score[0];
    }
  }

  function getFullWord() {
    let theword = [],
      colarr = [],
      rowarr = [];

    if (visited.size == 0) {
      if (queue.size == 0) {
        toast.info("No word found");
        return;
      }
    }

    let qarr = queue.printArray;

    for (let [letter, pos] of qarr) {
      rowarr.push(pos[0]);
      colarr.push(pos[1]);
    }

    let rowwise = Math.max(...rowarr) - Math.min(...rowarr) == 0;
    let colwise = Math.max(...colarr) - Math.min(...colarr) == 0;

    let wordidentifier = (letter, coord, rowwise, colwise) => {
      theword.push(letter);

      for (let dir of directtions) {
        let [dr, dc] = dir;
        let [newRow, newCol] = [coord[0] + dr, coord[1] + dc];

        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          continue;
        }

        while (visited.has([newRow, newCol])) {
          visitedvisited.add([newRow, newCol]);

          if (rowwise && newRow == dr) {
            let visited_letter = wordmap.get([newRow, newCol]);
            proposedWordScore += getLetterScore(visited_letter);

            if (newCol < coord[1]) {
              theword.unshift(visited_letter);
            } else {
              theword.push(visited_letter);
            }

            newCol += dc;
          }

          if (colwise) {
            let visited_letter = wordmap.get([newRow, newCol]);
            proposedWordScore += getLetterScore(visited_letter);

            if (newRow < coord[0]) {
              theword.unshift(visited_letter);
            } else {
              theword.push(visited_letter);
            }

            newRow += dr;
          }
        }
      }
    };

    if (rowwise || colwise) {
      for ([letter, pos] of qarr) {
        wordidentifier(letter, pos, rowwise, colwise);
      }
    } else {
      return [[], "invalid word -_o_-"];
    }

    return [theword, null];
  }

  function submit() {
    //calculate queue word score
    wholeWordScores.forEach((s) => {
      proposedWordScore *= s;
    });

    let [proposedWord, error] = getFullWord();

    if (error) {
      toast.error(error);
      return;
    }

    let words = [proposedWord, proposedWordScore];

    while (queue.size > 0) {
      let [letter, pos] = queue.dequeue();
      visited.add(pos);
      wordmap.set(pos, letter);

      let score = getLetterScore(letter);

      let derived_word = [letter];

      for (let dir of directtions) {
        let [row, col] = dir;
        let [newRow, newCol] = [pos[0] + row, pos[1] + col];

        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          continue;
        }

        while (visited.has([newRow, newCol]) && visitedvisited.has([newRow, newCol]) && !newlyVisited.has([newRow, newCol])) {
          let letter2 = wordmap.get([newRow, newCol]);
          derived_word.push(letter2);
          score += getLetterScore(letter2);

          [newRow, newCol] = [newRow + row, newCol + col];
        }
      }

      if (derived_word.length > 1) words.push([derived_word.join(""), score]);
    }

    console.log({ words, userdetails: $userStore });

    // $socket.emit("submit_words", { lang: game.lang, words });

    //TODO: clear queue and newlyvisited
    queue.clear();
    newlyVisited.clear();
  }

  const setToggleSideBar = () => (toggleSideBar = !toggleSideBar);

  const boardGrid = Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => ({ id: j })));

  const flipDurationMs = 300;

  $: dndOptions = {
    items,
    flipDurationMs,
    morphDisabled: true,
  };
</script>

<div class="game-container">
  <div class="flex {!toggleSideBar ? 'flex-row' : 'flex-row-reverse'}">
    <SideBottomMenu {setToggleSideBar} {submit} />

    <div class="board">
      <p class="text-4xl md:text-6xl text-white" style="font-family: 'Monoton', cursive;">
        <span>Scrabble</span>
      </p>

      <!-- board -->
      <div class="grid">
        {#each boardGrid as row, i}
          <div class="board-row">
            {#each row as square}
              <!-- {#if i==7 && square.id == 7}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items={[newlySubbmittedWord[2]]} />
              {:else}
              {/if} -->
              <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} />
            {/each}
          </div>
        {/each}
      </div>

      <!-- user deck -->
      <div class="rack" use:dndzone="{dndOptions}" on:finalize="{handleDnd}" on:consider="{handleDnd}">
        {#each items as item (item.id)}
          <div animate:flip="{{ duration: flipDurationMs }}">
            <Tile letter="{item.letter}" score="{getLetterScore(item.letter)}" />
          </div>
        {/each}
      </div>

      <SideBottomMenu isbottom="{true}" {submit} />
    </div>
  </div>
</div>

<style>
  :global(body *) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .game-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #272727;
    /* background-color: #fffae8; */
    justify-content: center;
    align-items: center;
  }

  .board {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .grid {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .board-row {
    display: flex;
    flex-direction: row;
  }

  .rack {
    display: flex;
    justify-content: center;
    flex-grow: 0;
    width: calc((min(5vmin, 50px) + 4px) * 8);
    margin-top: 10px;
    background-color: #393939;
    padding: 10px;
    @apply rounded-md;
  }
  .rack > * {
    margin: 2px;
  }
</style>
