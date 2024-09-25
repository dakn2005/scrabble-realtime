<script>
  import { onDestroy, onMount } from "svelte";
  import { flip } from "svelte/animate";
  import { goto } from "$app/navigation";
  import { dndzone } from "svelte-dnd-action";
  import { toast } from "svelte-sonner";
  import { ulid } from "ulid";
  // import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
  import * as Drawer from "$lib/components/ui/drawer";
  import { throttle } from "lodash-es";
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";
  import SideBottomMenu from "./SideBottomMenu.svelte";
  import ScoreChart from "./ScoreChart.svelte";
  import FloatingBtn from "$components/general/FloatingBtn.svelte";
  import IndeterminateProgressBar from "$components/general/IndeterminateProgressBar.svelte";
  // import Queue from "$lib/queue.js";
  import { SOCKET_URL, PROD } from "$lib/constants.js";
  import { socket, userStore, messages, settingsOpen, recoverTiles, history } from "$lib/stores.js";

  onMount(() => {
    autoplay = true;

    // ensure render free-tier is always up when on board
    setInterval(async () => {
      const resp = await fetch(SOCKET_URL + "/api/amka").catch(err => {
        $socket = null;
      });
      let stt = await resp.status;

      // console.log('amka! ', stt)
    }, 45000);

    setTimeout(() => {
      // console.log(currentPlayer);

      if (currentPlayer == undefined) {
        toast.warning("Couldn't communicate with the server");

        setTimeout(() => {
          $socket?.emit("leave_game", { username, gameName: game?.name });
          $userStore = {};
          $messages = [];

          goto("/");
        }, 2000);
      }
    }, 2000);
  });

  // onDestroy(() => {
  //   console.log("destroying", pickedTiles);

  //   if (pickedTiles.length > 0) $socket.emit("return_tiles", { game, tiles: pickedTiles });

  //   pickedTiles = [];
  // });
  let autoplay = true;
  let gamePlayers = [],
    remainingTiles = 0;
  let currentPlayer,
    pickedTiles = [
      // { id: ulid(), letter: "D" },
      // { id: ulid(), letter: "T" },
      // { id: ulid(), letter: "E" },
      // { id: ulid(), letter: "D" },
      // // { id: ulid(), letter: "M" },
      // // { id: ulid(), letter: "B" },
      // // { id: ulid(), letter: "O" },
      // // { id: ulid(), letter: "G" },
      // { id: ulid(), letter: "I" },
      // { id: ulid(), letter: "D" },
      // { id: ulid(), letter: "I" },
    ];

  let { username, game } = $userStore;

  let toggleSideBar = false;

  let lettersScores = {
    // 1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    // 2: ["D", "G"],
    // 3: ["B", "C", "M", "P"],
    // 4: ["F", "H", "V", "W", "Y"],
    // 5: ["K"],
    // 8: ["J", "X"],
    // 10: ["Q", "Z"],
  };

  let directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let queue = []; //new Queue();
  let visited = new Set();

  let newlyVisited = new Map(),
    newlyVisitedBroadcast = new Map();
  let wordMap = new Map();
  let wholeWordScores = [];
  let proposedTotalWordScore = 0;
  // let playerWordSubmittedStatusCss = '';


  // let newlySubbmittedWord = [
  //   { id: 1, letter: "M" },
  //   { id: 2, letter: "B" },
  //   { id: 3, letter: "O" },
  // ];
  const setToggleSideBar = () => (toggleSideBar = !toggleSideBar);

  let boardGrid = Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => ({ id: j })));

  const flipDurationMs = 300;

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

  function proposedWordQueue(id, letter, position, score) {
    let calcScore = () => {
      proposedTotalWordScore = 0;
      wholeWordScores = [];

      for (let [, lerrer, , sko] of queue) {
        if (sko[0] > 1) {
          if (sko[1] == "tw" || sko[1] == "dw" || sko[1] == "m") {
            wholeWordScores.push(sko[0]);
            proposedTotalWordScore += getLetterScore(lerrer);
          } else if (sko[1] == "dl" || sko[1] == "tl") {
            proposedTotalWordScore += getLetterScore(lerrer) * sko[0];
          }
        } else {
          proposedTotalWordScore += getLetterScore(lerrer);
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

    // playerWordSubmittedStatusCss = "";

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

    let invalidWordArr = [[], [], "invalid word, ensure the tiles are properly set"];

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

        while (wordMap.has(`${newRow},${newCol}`) && !visited.has(`${newRow},${newCol}`)) {
          if (rowwise && newRow == coord[0]) {
            visited.add(`${newRow},${newCol}`);
            let visited_letter = wordMap.get(`${newRow},${newCol}`);
            proposedTotalWordScore += getLetterScore(visited_letter);

            if (newCol < coord[1]) {
              theword.unshift(visited_letter);
              thewordcoords.unshift([newRow, newCol]);
            } else {
              theword.push(visited_letter);
              thewordcoords.push([newRow, newCol]);
            }

            newCol += dc;
          } else if (colwise && newCol == coord[1]) {
            visited.add(`${newRow},${newCol}`);
            let visited_letter = wordMap.get(`${newRow},${newCol}`);
            proposedTotalWordScore += getLetterScore(visited_letter);

            if (newRow < coord[0]) {
              theword.unshift(visited_letter);
              thewordcoords.unshift([newRow, newCol]);
            } else {
              theword.push(visited_letter);
              thewordcoords.push([newRow, newCol]);
            }

            newRow += dr;
          } else {
            break;
          }
        }
      }
    };

    // if (wordMap.size == 0) {
    if (queue.length == 0) {
      return [[], [], "No tile has been set"];
    }
    // }

    if (wordMap.get("7,7") == undefined && newlyVisited.get("7,7") == undefined) {
      return [[], [], "Beginning of game must have a letter in the middle tile"];
    }

    for (let [, , pos] of queue) {
      rowarr.push(pos[0]);
      colarr.push(pos[1]);
    }

    let rowwise = Math.max(...rowarr) - Math.min(...rowarr) == 0;
    let colwise = Math.max(...colarr) - Math.min(...colarr) == 0;

    if (rowwise || colwise) {
      let queueSort = {};

      for (let q of queue) {
        let s = q[2][0] + q[2][1];
        queueSort[s] = q;
      }

      queue = Object.values(queueSort);

      for (let [, letter, pos] of queue) {
        wordidentifier(letter, pos, rowwise, colwise);
      }
    } else {
      return invalidWordArr;
    }

    // further validations
    //validation I - prevent floating words
    if (wordMap.get("7,7")) {
      if (!thewordcoords.some((c) => [...wordMap.keys()].includes(`${c[0]},${c[1]}`))) {
        return [[], [], "Floating word not allowed"];
      }
    }

    //validation II - prevent letter gaps
    colarr = [];
    rowarr = [];
    thewordcoords.forEach((pos) => {
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

    return colwise || rowwise ? [theword.join(""), thewordcoords, null] : invalidWordArr;
  }

  let words = [],
    isloading = false;

  function submit() {
    isloading = true;
    words = [];

    //TODO: single digit placement
    if (queue.length == 1) {
      let [, letter, pos] = queue[0];
      let [row, col] = pos;
      let row_upward = row - 1,
        row_downward = row + 1;
      let col_backward = col - 1,
        col_forward = col + 1;
      let score = proposedTotalWordScore;

      let derivedWord = [letter];
      let derivedWordCoords = [pos];
      while (wordMap.has(`${row_upward},${col}`) || wordMap.has(`${row_downward},${col}`)) {
        let letter2 = wordMap.get(`${row_upward},${col}`);
        if (letter2) {
          score += getLetterScore(letter2);
          derivedWord.unshift(letter2);
          derivedWordCoords.unshift([row_upward, col]);
          row_upward -= 1;
        }
        let letter3 = wordMap.get(`${row_downward},${col}`);
        if (letter3) {
          score += getLetterScore(letter3);
          derivedWord.push(letter3);
          derivedWordCoords.push([row_downward, col]);
          row_downward += 1;
        }
      }
      if (derivedWord.length > 1) {
        wholeWordScores.forEach((s) => {
          score *= s;
        });

        words.push([derivedWord.join(""), derivedWordCoords, score]);
      }

      derivedWord = [letter];
      derivedWordCoords = [pos];
      score = proposedTotalWordScore;
      while (wordMap.has(`${row},${col_backward}`) || wordMap.has(`${row},${col_forward}`)) {
        let letter4 = wordMap.get(`${row},${col_backward}`);
        if (letter4) {
          score += getLetterScore(letter4);
          derivedWord.unshift(letter4);
          derivedWordCoords.unshift([row, col_backward]);
          col_backward -= 1;
        }

        let letter5 = wordMap.get(`${row},${col_forward}`);
        if (letter5) {
          score += getLetterScore(letter5);
          derivedWord.push(letter5);
          derivedWordCoords.push([row, col_forward]);
          col_forward += 1;
        }
      }
      if (derivedWord.length > 1) {
        wholeWordScores.forEach((s) => {
          score *= s;
        });

        words.push([derivedWord.join(""), derivedWordCoords, score]);
      }

      // console.log({ words, userdetails: $userStore });

      if (words.length == 0) {
        isloading = false;
        toast.error("Word Not Found :-(", { duration: 2500 });
      } else $socket.emit("submit_words", { username, game, words, recoverTiles: pickedTiles?.map((t) => t.letter), nv: Object.fromEntries(newlyVisited) });

      return;
    }

    //* handle word extension e.g. bad n badminton
    //TODO: Handle middle word placement after getting full word
    let [proposedWord, proposedWordCoords, error] = getFullWord();

    if (error) {
      isloading = false;
      toast.info(error);
      return;
    }

    //calculate queue word score
    wholeWordScores.forEach((s) => {
      proposedTotalWordScore *= s;
    });

    words = [[proposedWord, proposedWordCoords, proposedTotalWordScore]];

    // while (queue.length > 0) {
    //queue.shift();
    for (let qelem of queue) {
      let [, letter, pos] = qelem;

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
          visited.add(`${newRow},${newCol}`);
          [newRow, newCol] = [newRow + dr, newCol + dc];
        }
      }

      if (derivedWord.length > 1) words.push([derivedWord.join(""), derivedWordCoords, score]);
    }

    // console.log({ words, userdetails: $userStore });

    $socket.emit("submit_words", { username, game, words, recoverTiles: pickedTiles?.map((t) => t.letter), nv: Object.fromEntries(newlyVisited) });
  }

  function pickTilesFunc() {
    // console.log("picking tiles", newlyVisited);
    if (newlyVisited.size == 0) {
      let tiles_2_pick = 7 - pickedTiles.length;
      $socket.emit("pick_tiles", { game, tiles_2_pick });
    } else {
      toast.info("Already in play, can only pick tiles when not in play, or return all tiles to set");
    }
  }

  function passMeFunc() {
    if (confirm("Pass to next player?")) $socket.emit("pass_me", { game });
  }

  function adminResetGame() {
    if (confirm("Reset Game?"))
      $socket.emit("reset_game", { username, game });
  }

  function adminRemovePlayer(pName) {
    // console.log(pName)

    if (confirm('Remove selected player?'))
      $socket.emit("leave_game", { username: pName, gameName: game?.name, removeOtherPlayer: true });
  }

  const leaveGameFunc = () => {
    if (confirm("Leave game?")) {
      $socket.emit("leave_game", { username, gameName: game?.name, recoverTiles: pickedTiles?.map((t) => t.letter) });
      $userStore = {};
      $messages = [];

      goto("/");
    }
  };

  $: if (pickedTiles) {
    // check whether id is in both pickedletters and queue, delete if so
    let proposedIds = {};

    queue.forEach((q, i) => {
      proposedIds[q[0]] = i;
    });

    for (let { id } of pickedTiles) {
      if (Object.keys(proposedIds).includes(id)) {
        let spliced = queue.splice(proposedIds[id], 1);
        let pos = spliced[0][2];
        newlyVisited.delete(`${pos[0]},${pos[1]}`);

        $socket.emit("player_playing", {
          nv: Object.fromEntries(newlyVisited),
          game,
        });

        newlyVisited = newlyVisited;
      }
    }
  }

  $: dndOptions = {
    items: pickedTiles,
    flipDurationMs,
    morphDisabled: true,
    dragDisabled: currentPlayer?.toLowerCase() != username?.toLowerCase(),
  };

  // $: console.log($socket)

  $: if (!$socket || $socket == null) {
    toast.warning("Issues communicating with the server");
    $recoverTiles = pickedTiles?.map((t) => t.letter);
    goto("/");
  }

  $socket?.on("words_submitted", (data) => {
    // console.log(data, newlyVisited);
    isloading = false;

    if (data.status == "broadcast") {
      Object.entries(data.nv).forEach((nv) => {
        let [pos, l] = nv;
        wordMap.set(pos, l);
      });

      // console.log(newlyVisitedBroadcast, wordMap)
      newlyVisitedBroadcast.clear();

      newlyVisitedBroadcast = newlyVisitedBroadcast;
      wordMap = wordMap;
      $history = data.history;
    } else {
      if (data.status == "fiti") {
        newlyVisited.forEach((v, k) => {
          wordMap.set(k, v);
        });

        // console.log(newlyVisited, wordMap);
        queue = [];
        visited.clear();
        newlyVisited.clear();

        newlyVisited = newlyVisited;
        wordMap = wordMap;

        $history = [
          {
            player: username,
            masaa: new Date(),
            wordscore: words.map((w) => [w[0], w[2]]),
          },
          ...$history,
        ];

        toast.success("Word Accepted :-)", { duration: 2000 });
      } else if (data.status == "chorea") {
        visited.clear();
        toast.error("Word Not Found :-(", { duration: 2500 });
      }

      // playerWordSubmittedStatusCss = data.status;
    }

    if (document.getElementById("hist-container")) document.getElementById("hist-container").scrollTop = document.getElementById("hist-container")?.scrollHeight;
  });

  $socket?.on("player_playing", (data) => {
    newlyVisitedBroadcast.clear();

    Object.entries(data).forEach((nv) => {
      let [pos, l] = nv;
      newlyVisitedBroadcast.set(pos, l);
    });

    // console.log(newlyVisitedBroadcast);
    boardGrid = boardGrid;
  });

  $socket?.on("init_gamestate", (state) => {
    //assumption state has already been loaded
    if (pickedTiles.length > 0) return;

    //init tiles
    remainingTiles = state.tiledata.remaining;

    state.tiledata.tiles.forEach((t) => {
      pickedTiles.push({
        id: ulid(),
        letter: t,
      });
    });

    pickedTiles = pickedTiles;

    //init gamestate
    state.wordsdata.forEach((worddatum) => {
      let [word, coords] = worddatum[0];
      let wordarr = word.split("");

      coords.forEach((coord) => {
        wordMap.set(coord.join(","), wordarr.shift());
      });
    });

    wordMap = wordMap;

    lettersScores = state.lettersScores;

    $history = state.history;

    // console.log(state)
    // console.log(pickedTiles)
    // console.log(wordMap);
  });

  $socket?.on("ingame_players", (data) => {
    if (data) gamePlayers = data;

    // console.log("ingame_players", data);
  });

  $socket?.on("current_player", (player) => {
    currentPlayer = player;
    toast.info(`It's ${player}'s turn`, { duration: 4000 });
    // console.log("current player", player, temp_1);
  });

  $socket?.on("tiles_picked", (data) => {
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

  $socket?.on("receive_message", (data) => {
    $messages = [
      {
        message: data.message,
        username: data.username,
        __createdtime__: data.__createdtime__,
      },
      ...$messages,
    ];

    // console.log(document.getElementById("chats-container")?.scrollHeight);

    // if (document.getElementById("chats-container")) {
    //   document.getElementById("chats-container").scrollTop = document.getElementById("chats-container")?.scrollHeight + 150;
    //   document.getElementById("chats-container").scrollIntoView({ behavior: "smooth" });
    // }

    // }, 1000);
  });

  $socket?.on("umeleftishwa", (data) => {
    if (data.reset)
      toast('Game has been reset by Game\'s creator', 3000);
    else
      toast("You've been removed from the game", 3000);


    setTimeout(()=>{

      if (username == data.username){
        $userStore = {};
        $messages = [];
  
        goto("/");
      }
    }, 3000)
  });
</script>

<IndeterminateProgressBar {isloading} />

<div class="game-container game-height">
  <div class="flex {!toggleSideBar ? 'flex-row' : 'flex-row-reverse'}">
    <SideBottomMenu {setToggleSideBar} {submit} {pickTilesFunc} {passMeFunc} {leaveGameFunc} disabled="{currentPlayer?.toLowerCase() != username?.toLowerCase()}" />

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
                <Square
                  row_id="{i}"
                  tile_id="{square.id}"
                  {getLetterScore}
                  {proposedWordQueue}
                  items="{[{ id: ulid(), letter: newlyVisitedBroadcast.get(`${i},${square.id}`) }]}"
                  disabled="{currentPlayer?.toLowerCase() != username?.toLowerCase()} "
                  disabledBroadcasted="{true}" />
              {:else if wordMap.has(`${i},${square.id}`)}
                <Square row_id="{i}" tile_id="{square.id}" {getLetterScore} {proposedWordQueue} items="{[{ id: ulid(), letter: wordMap.get(`${i},${square.id}`) }]}" disabled="{true}" />
                <!-- {playerWordSubmittedStatusCss} -->
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

      <SideBottomMenu isbottom="{true}" {setToggleSideBar} {submit} {pickTilesFunc} {passMeFunc} {leaveGameFunc} disabled="{currentPlayer?.toLowerCase() != username?.toLowerCase()}" />
    </div>
  </div>
</div>
<!-- <FloatingBtn /> -->

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
      <div class="w-full text-center">
        {#if username == game.admin}
          <button class="text-xs text-white btn btn-xs btn-error" on:click="{() => adminResetGame()}"> reset game </button>
        {/if}
      </div>
    </Drawer.Header>

    <!-- divider here -->
    <!-- users[scores] | tiles left | turn history |  -->

    <div class="flex flex-col md:flex-row w-full p-6 md:p-2">
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <div class="flex flex-row">
          {#each gamePlayers as player}
            <div class="border-t-4 rounded w-1/2 text-xs mr-3 flex flex-row {player.username == currentPlayer ? 'border-green-400 bg-green-300' : 'border-slate-400 bg-slate-200'}">
              {#if username == game.admin && player.username != username}
                <button class="w-1/12 h-full text-center cursor-pointer {player.username == currentPlayer ? ' bg-green-400' : ' bg-slate-400'}" on:click="{() => adminRemovePlayer(player.username)}"> &times; </button>
              {/if}
              <div class="text-center p-1 {username == game.admin ? 'w-11/12' : 'w-full'}">
                <span>
                  {player.username}
                  {player.username.toLowerCase() == username.toLowerCase() ? "(you)" : ""}
                </span>
                <div class="badge">{player.score}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="w-full md:w-1/3 text-center md:flex-col flex-row mb-4 md:mb-0">
        <span class="text-5xl md:text-6xl font-semibold">{remainingTiles}</span>
        <span>tiles left</span>
      </div>

      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <div class="flex flex-col text-center justify-center w-[200px] -mt-10">
          <DotLottieSvelte src="coffee2.lottie" background="transparent" speed="1" style="width: 100px; height: 100px" direction="1" playMode="normal" autoplay loop></DotLottieSvelte>
          <!-- <ScoreChart /> -->
          <details class="dropdown dropdown-top">
            <summary class="btn text-white pacifico-regular bg-amber-400 hover:bg-amber-600">Buy me a coffee</summary>
            <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <a href="https://buymeacoffee.com/dakn2005" target="_blank" class="flex justify-between">
                  <span>Card</span>
                  <span>&rarr;</span>
                </a>
              </li>
              <li>
                <!-- window.open(location.origin+'/coffee/mpesa', '_blank') -->
                  <a href="{ location.origin + '/coffee/mpesa' + (PROD ? '.html' : '') }" target="_blank" class="flex justify-between">
                    <span>MPesa</span>
                    <span>&rarr;</span>
                  </a>
                
              </li>
            </ul>
          </details>
          
            <!-- <i class="fa-solid fa-mug-hot"></i> -->
        </div>
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

  .pacifico-regular {
    font-family: "Pacifico", cursive;
    font-weight: 400;
    font-style: normal;
  }

  .playwrite-cuba {
    font-family: "Playwrite CU", cursive;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  }
</style>
