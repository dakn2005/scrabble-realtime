<script>
  import { onDestroy, onMount } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { toast } from "svelte-sonner";
  import { v4 as uuidv4 } from "uuid";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";
  import SideBottomMenu from "./SideBottomMenu.svelte";
  // import Queue from "$lib/queue.js";
  import { socket, userStore } from "$lib/stores.js";

  let { username, game } = $userStore;

  // TODO: set user from server buana!
  let currentUser = username;

  let toggleSideBar = false;

  onMount(() => {
    if ($socket) {
      $socket.emit("pick_tiles", { game, tiles_2_pick: 7 - pickedLetters.length });
    }
  });

  onDestroy(() => {
    pickedLetters = [];

    // TODO: return tiles!
  });

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

  // let lettersDistribution = {
  //   1: ["J", "K", "Q", "X", "Z"],
  //   2: ["B", "C", "F", "H", "M", "P", "V", "W", "Y"],
  //   3: ["G"],
  //   4: ["D", "L", "S", "U"],
  //   6: ["N", "R", "T"],
  //   8: ["O"],
  //   9: ["A", "I"],
  //   12: ["E"],
  // };

  let directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function getLetterScore(letter) {
    for (const [key, value] of Object.entries(lettersScores)) {
      if (value.includes(letter)) {
        return parseInt(key);
      }
    }
  }

  let pickedLetters = [
    { id: 1, letter: "M" },
    { id: 2, letter: "B" },
    { id: 3, letter: "O" },
    { id: 4, letter: "G" },
    { id: 5, letter: "I" },
    { id: 6, letter: "D" },
    { id: 7, letter: "I" },
  ];

  function handleDnd(e) {
    pickedLetters = e.detail.items;
  }

  let queue = []; //new Queue();
  let visited = new Set();
  let newlyVisited = new Map();
  let wordMap = new Map();
  let wholeWordScores = [];
  let proposedWordScore = 0;
  let newlySubbmittedWord = [
    { id: 1, letter: "M" },
    { id: 2, letter: "B" },
    { id: 3, letter: "O" },
  ];

  function proposedWordQueue(id, letter, position, score) {
    // console.log(id, letter, position, score)

    let calcScore = () => {
      proposedWordScore = 0;
      wholeWordScores = [];

      for (let [, lerrer, , sko] of queue) {
        if (sko[0] > 1) {
          if (sko[1] == "tw" || sko[1] == "dw" || sko[1] == "m") {
            wholeWordScores.push(sko[0]);
            proposedWordScore += getLetterScore(lerrer);
          } else if (sko[1] == "dl" || sko[1] == "tl") {
            proposedWordScore += getLetterScore(lerrer) * sko[0];
          }
        } else {
          proposedWordScore += getLetterScore(lerrer);
        }
      }
    };

    // reposition existing letter
    if (queue.length > 0 && queue.find((arr) => arr[0] == id)) {
      let idx = 0;
      for (let [zeid, , ,] of queue) {
        if (zeid == id) break;
        idx++;
      }

      queue[idx] = [id, letter, position, score];
    } else {
      queue.push([id, letter, position, score]);
      newlyVisited.set(`${position[0]},${position[1]}`, letter);
      $socket.emit("player_playing", {
        nv: newlyVisited,
        game,
      });
    }

    calcScore();
  }

  function getFullWord() {
    let theword = [],
      thewordcoords = [];
    let colarr = [],
      rowarr = [];

    if (wordMap.size == 0) {
      if (queue.length == 0) {
        toast.info("No word found");
        return;
      }
    }

    for (let [, , pos] of queue) {
      rowarr.push(pos[0]);
      colarr.push(pos[1]);
    }

    let rowwise = Math.max(...rowarr) - Math.min(...rowarr) == 0;
    let colwise = Math.max(...colarr) - Math.min(...colarr) == 0;

    let wordidentifier = (letter, coord, rowwise, colwise) => {
      let lastcoords = thewordcoords.length > 0 ? thewordcoords.at(-1) : null;

      if (rowwise && lastcoords != null && coord[1] < lastcoords[1]) {
        theword.unshift(letter);
        thewordcoords.unshift(coord);
      } else if (colwise && lastcoords != null && coord[0] < lastcoords[0]) {
        theword.unshift(letter);
        thewordcoords.unshift(coord);
      } else {
        theword.push(letter);
        thewordcoords.push(coord);
      }

      for (let [dr, dc] of directions) {
        let [newRow, newCol] = [coord[0] + dr, coord[1] + dc];

        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          continue;
        }

        while (wordMap.has(`${newRow},${newCol}`)) {
          visited.add(`${newRow},${newCol}`);

          if (rowwise) {
            let visited_letter = wordMap.get(`${newRow},${newCol}`);
            proposedWordScore += getLetterScore(visited_letter);

            if (newCol < coord[1]) {
              theword.unshift(visited_letter);
              thewordcoords.unshift([newRow, newCol]);
            } else {
              theword.push(visited_letter);
              thewordcoords.push([newRow, newCol]);
            }

            newCol += dc;
          }

          if (colwise) {
            let visited_letter = wordMap.get(`${newRow},${newCol}`);
            proposedWordScore += getLetterScore(visited_letter);

            if (newRow < coord[0]) {
              theword.unshift(visited_letter);
              thewordcoords.unshift([newRow, newCol]);
            } else {
              theword.push(visited_letter);
              thewordcoords.push([newRow, newCol]);
            }

            newRow += dr;
          }
        }
      }
    };

    if (rowwise || colwise) {
      for (let [, letter, pos] of queue) {
        wordidentifier(letter, pos, rowwise, colwise);
      }
    } else {
      return [[], [], "invalid word :("];
    }

    return [theword.join(""), thewordcoords, null];
  }

  function submit() {
    //calculate queue word score
    wholeWordScores.forEach((s) => {
      proposedWordScore *= s;
    });

    let [proposedWord, proposedWordCoords, error] = getFullWord();

    if (error) {
      toast.warning(error);
      return;
    }

    let words = [[proposedWord, proposedWordCoords, proposedWordScore]];

    while (queue.length > 0) {
      let [, letter, pos] = queue.shift();

      // wordMap.set(`${pos[0]},${pos[1]}`, letter);

      let score = getLetterScore(letter);

      let derivedWord = [letter];
      let derivedWordCoords = [pos];

      for (let [dr, dc] of directions) {
        let [newRow, newCol] = [pos[0] + dr, pos[1] + dc];

        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15) {
          continue;
        }

        while (wordMap.has(`${newRow},${newCol}`) && !visited.has(`${newRow},${newCol}`) && !newlyVisited.has(`${newRow},${newCol}`)) {
          let letter2 = wordMap.get(`${newRow},${newCol}`);

          if (newRow < pos[0] || newCol < pos[1]) {
            derivedWord.unshift(letter2);
            derivedWordCoords.unshift([newRow, newCol]);
          } else {
            derivedWord.push(letter2);
            derivedWordCoords.push([newRow, newCol]);
          }

          score += getLetterScore(letter2);

          [newRow, newCol] = [newRow + dr, newCol + dc];
        }
      }

      if (derivedWord.length > 1) words.push([derivedWord.join(""), derivedWordCoords, score]);
    }

    console.log({ words, userdetails: $userStore });

    $socket.emit("submit_words", { username, game, words, newlyVisited });
  }

  const setToggleSideBar = () => (toggleSideBar = !toggleSideBar);

  const boardGrid = Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => ({ id: j })));

  const flipDurationMs = 300;

  $: if (pickedLetters) {
    // check whether id is in both pickedletters and queue, delete if so
    let proposedIds = queue.map((q, i) => ({ [q[0]]: i }));

    for (let { id, letter } of pickedLetters) if (Object.keys(proposedIds).includes(id)) queue.splice(proposedIds[id], 1);
  }

  $: dndOptions = {
    items: pickedLetters,
    flipDurationMs,
    morphDisabled: true,
    // dragDisabled: true,
  };

  $: if ($socket) {

    $socket.on("tiles_picked", (data) => {
      let idx = 0;

      if (pickedLetters.length == 7) return;

      data.forEach((t) => {
        pickedLetters.push({
          id: idx++,
          letter: t,
        });
      });

      pickedLetters = pickedLetters;
    });

    $socket.on("words_submitted", (data) => {
      if (data.status == "broadcast") {
        data.newlyVisited.forEach((pos, l) => {
          wordMap.set(pos, l);
        });
      } else {
        if (data.status == "fiti") {
          newlyVisited.clear();
          queue = [];
        } else if (data.status == "chorea") {
          newlyVisited.clear();
        }
      }
    });

    $socket.on("player_playing", (nv) => {
      console.log("player_playing");

      nv.forEach((pos, l) => {
        newlyVisited.set(pos, l);
      });
    });

  }
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
              {#if newlyVisited.length > 0 && newlyVisited.has(`${i}${square.id}`)}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items="{[{ id: uuidv4(), letter: newlyVisited.get(`${i}${square.id}`) }]}" disabled="{currentUser !== username}" />
              {:else if wordMap.has(`${i}${square.id}`)}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items="{[{ id: uuidv4(), letter: wordMap.get(`${i}${square.id}`) }]}" disabled="{true}" />
              {:else}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} />
              {/if}
            {/each}
          </div>
        {/each}
      </div>

      <!-- user deck -->
      <div class="rack" use:dndzone="{dndOptions}" on:finalize="{handleDnd}" on:consider="{handleDnd}" disabled>
        {#if pickedLetters.length > 0}
          {#each pickedLetters as item (item.id)}
            <div animate:flip="{{ duration: flipDurationMs }}">
              <Tile id="{item.id}" letter="{item.letter}" score="{getLetterScore(item.letter)}" />
            </div>
          {/each}
        {/if}
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
    height: 100%;
    background-color: #272727;
    /* background-color: #fffae8; */
    justify-content: center;
    align-items: center;
    padding-top: 40px;
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
