<script>
  import { onDestroy, onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { goto } from "$app/navigation";
  import { dndzone } from "svelte-dnd-action";
  import { toast } from "svelte-sonner";
  import { ulid } from "ulid";
  // import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
  import * as Drawer from "$lib/components/ui/drawer";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";
  import SideBottomMenu from "./SideBottomMenu.svelte";
  import ScoreChart from "./ScoreChart.svelte";
  // import Queue from "$lib/queue.js";

  import { socket, userStore, messages, settingsOpen } from "$lib/stores.js";

  onMount(() => {
    setTimeout(() => {
      // console.log(currentPlayer);

      if (currentPlayer == undefined) {
        $socket.emit("leave_game", { username, gameName: game?.name });
        $userStore = {};
        $messages = [];

        goto("/");
      }
      // console.log('runned')
    }, 4000);
  });

  let gamePlayers = [],
    remainingTiles = 0;
  let currentPlayer,
    pickedTiles = [
      // { id: ulid(), letter: "M" },
      // { id: ulid(), letter: "B" },
      // { id: ulid(), letter: "O" },
      // { id: ulid(), letter: "G" },
      // { id: ulid(), letter: "I" },
      // { id: ulid(), letter: "D" },
      // { id: ulid(), letter: "I" },
    ];

  let { username, game } = $userStore;

  let toggleSideBar = false;

  onDestroy(() => {
    if (pickedTiles.length > 0) $socket.emit("return_tiles", { game, tiles: pickedTiles });

    pickedTiles = [];
  });

  let lettersScores = {
    1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    2: ["D", "G"],
    3: ["B", "C", "M", "P"],
    4: ["F", "H", "V", "W", "Y"],
    5: ["K"],
    8: ["J", "X"],
    10: ["Q", "Z"],
  };

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

  function handleDnd(e) {
    pickedTiles = e.detail.items;
  }

  let queue = []; //new Queue();
  let visited = new Set();
  let newlyVisited = new Map(),
    newlyVisitedBroadcast = new Map();

  let wordMap = new Map();
  let wholeWordScores = [];
  let proposedWordScore = 0;

  // let newlySubbmittedWord = [
  //   { id: 1, letter: "M" },
  //   { id: 2, letter: "B" },
  //   { id: 3, letter: "O" },
  // ];

  function proposedWordQueue(id, letter, position, score) {
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

    // update existing letter grid pos
    if (queue.length > 0 && queue.find((arr) => arr[0] == id)) {
      let idx = 0;
      for (let [zeid, , oldPos] of queue) {
        if (zeid == id) {
          break;
        }
        idx++;
      }

      queue[idx] = [id, letter, position, score];

      newlyVisited.clear();
      queue.forEach((q) => {
        newlyVisited.set(`${q[2][0]},${q[2][1]}`, q[1]);
      });
    } else {
      queue.push([id, letter, position, score]);
      newlyVisited.set(`${position[0]},${position[1]}`, letter);
    }

    $socket.emit("player_playing", {
      nv: Object.fromEntries(newlyVisited),
      game,
    });

    calcScore();
  }

  function getFullWord() {
    let theword = [],
      thewordcoords = [];

    let colarr = [],
      rowarr = [];

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

    if (wordMap.size == 0) {
      if (queue.length == 0) {
        return [[], [], "No word found"];
      }
    }

    if (wordMap.get("7,7") == undefined && newlyVisited.get("7,7") == undefined) {
      return [[], [], "Beginning of game must have a letter in the middle tile"];
    }

    for (let [, , pos] of queue) {
      rowarr.push(pos[0]);
      colarr.push(pos[1]);
    }

    let rowwise = Math.max(...rowarr) - Math.min(...rowarr) == 0;
    let colwise = Math.max(...colarr) - Math.min(...colarr) == 0;

    // further validations
    if (rowwise || colwise) {
      let queueSort = {};

      for (let q of queue) {
        let s = q[2][0] + q[2][1];
        queueSort[s] = q;
      }

      colarr = [];
      rowarr = [];
      queue = Object.values(queueSort);

      console.log(queue);

      queue.forEach((q) => {
        let pos = q[2];
        rowarr.push(pos[0]);
        colarr.push(pos[1]);
      });

      rowarr.reduce((a, b) => {
        let minus = Math.abs(a - b);
        if (minus > 1) {
          colwise = false;
          rowwise = false;
        }

        return b;
      });

      colarr.reduce((a, b) => {
        let minus = Math.abs(a - b);

        if (minus > 1) {
          rowwise = false;
          colwise = false;
        }

        return b;
      });
    }

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
      toast.info(error);
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

    // $socket.emit("submit_words", { username, game, words, newlyVisited });
  }

  const setToggleSideBar = () => (toggleSideBar = !toggleSideBar);

  let boardGrid = Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => ({ id: j })));

  const flipDurationMs = 300;

  $: if (pickedTiles) {
    // check whether id is in both pickedletters and queue, delete if so
    let proposedIds = {};

    queue.forEach((q, i) => {
      proposedIds[q[0]] = i;
    });

    for (let { id } of pickedTiles) {
      if (Object.keys(proposedIds).includes(id)) {
        queue.splice(proposedIds[id], 1);
      }
    }
  }

  $: dndOptions = {
    items: pickedTiles,
    flipDurationMs,
    morphDisabled: true,
    dragDisabled: currentPlayer?.toLowerCase() != username?.toLowerCase(),
  };

  $: if ($socket) {
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

    $socket.on("player_playing", (data) => {
      newlyVisitedBroadcast.clear();

      Object.entries(data).forEach((nv) => {
        let [pos, l] = nv;
        newlyVisitedBroadcast.set(pos, l);
      });

      // console.log(newlyVisitedBroadcast);
      boardGrid = boardGrid;
    });

    $socket.on("ingame_players", (data) => {
      gamePlayers = data;
      // console.log("ingame_players", data);
    });

    $socket.on("current_player", (player) => {
      currentPlayer = player;
      // console.log("current_player", player);
    });

    $socket.on("tiles_picked", (data) => {
      if (pickedTiles.length == 7) return;

      remainingTiles = data.remaining;

      data.tiles.forEach((t) => {
        pickedTiles.push({
          id: ulid(),
          letter: t,
        });
      });

      pickedTiles = pickedTiles;
    });

    // $socket.on("receive_message", (data) => {
    //   $messages = [
    //     ...$messages,
    //     {
    //       message: data.message,
    //       username: data.username,
    //       __createdtime__: data.__createdtime__,
    //     },
    //   ];
    // });
  }
</script>

<div class="game-container game-height">
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
              {#if newlyVisitedBroadcast.size > 0 && newlyVisitedBroadcast.has(`${i},${square.id}`)}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items="{[{ id: ulid(), letter: newlyVisitedBroadcast.get(`${i},${square.id}`) }]}" disabled="{currentPlayer !== username}" />
              {:else if wordMap.has(`${i}${square.id}`)}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items="{[{ id: ulid(), letter: wordMap.get(`${i},${square.id}`) }]}" disabled="{true}" />
              {:else}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} />
              {/if}
            {/each}
          </div>
        {/each}
      </div>

      <!-- user deck -->

      <div class="rack" use:dndzone="{dndOptions}" on:finalize="{handleDnd}" on:consider="{handleDnd}">
        {#if pickedTiles.length > 0}
          {#each pickedTiles as item (item.id)}
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

<Drawer.Root bind:open="{$settingsOpen}">
  <!-- <Drawer.Trigger></Drawer.Trigger> -->
  <Drawer.Content>
    <Drawer.Header>
      <!-- <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description> -->
      <div class="w-full text-center">
        <span class="text-md">
          {game.name}
        </span>

        <span class="text-sm italic">
          ({game.lang})
        </span>
      </div>
    </Drawer.Header>

    <!-- divider here -->
    <!-- users[scores] | tiles left | turn history |  -->

    <div class="flex flex-col md:flex-row w-full p-6 md:p-2">
      <div class="w-full md:w-1/3 md:text-center">

        <div class="flex flex-row">
          {#each gamePlayers as player}
            <span class="border-t-4 rounded w-1/3 md:w-1/2 text-xs mr-3 p-1 {player.username == currentPlayer ? 'border-green-400 bg-green-300' : 'border-slate-400 bg-slate-200'}">
              {player.username} {player.username.toLowerCase() == username.toLowerCase() ? "(you)" : ""}
              <div class="badge">{0}</div>
            </span>
          {/each}
        </div>
      </div>

      <div class="w-full md:w-1/3 md:text-center">
        <span class="text-5xl md:text-6xl font-semibold">{remainingTiles}</span>
        <br />
        <span>tiles left</span>
      </div>

      <div class="w-full md:w-1/3 md:text-center">
        <ScoreChart />
      </div>
    </div>

    <Drawer.Footer>
      <!-- <Drawer.Close>Cancel</Drawer.Close> -->
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<style>
  :global(body *) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .game-container {
    display: flex;
    flex-direction: column;
    background-color: #272727;
    /* background-color: #fffae8; */
    justify-content: center;
    align-items: center;
    padding-top: 20px;
  }

  .game-height {
    height: 100%;
  }

  @media only screen and (max-width: 600px) {
    .game-height {
      height: 100vh;
    }
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
