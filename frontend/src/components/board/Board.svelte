<script>
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";
  import SideBottomMenu from "./SideBottomMenu.svelte";

  let toggleSideBar = false;

  let lettersBag = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  let lettersScores = {
    1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    2: ["D", "G"],
    3: ["B", "C", "M", "P"],
    4: ["F", "H", "V", "W", "Y"],
    5: ["K"],
    8: ["J", "X"],
    10: ["Q", "Z"],
  };

  let items = [];
  items = [
    { id: 1, letter: "A" },
    { id: 2, letter: "B" },
    { id: 3, letter: "C" },
  ];

  function handleDnd(e) {
    items = e.detail.items;
  }

  const setToggleSideBar = () => toggleSideBar = !toggleSideBar;

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

    <SideBottomMenu {setToggleSideBar} />

    <div class="board" >
      <p class="text-4xl md:text-6xl text-white" style="font-family: 'Monoton', cursive;">
        <span>Scrabble</span>
      </p>
      
      <!-- board -->
      <div class="grid">
        {#each boardGrid as row, i}
          <div class="board-row">
            {#each row as square}
              <Square row_id="{i}" tile_id="{square.id}" />
            {/each}
          </div>
        {/each}
      </div>

      <!-- user deck -->
      <div class="rack" use:dndzone="{dndOptions}" on:finalize="{handleDnd}" on:consider="{handleDnd}">
        {#each items as item (item.id)}
          <div animate:flip="{{ duration: flipDurationMs }}">
            <Tile letter="{item.letter}" />
          </div>
        {/each}
      </div>

      <SideBottomMenu isbottom={true} />
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
    width: calc((min(5vmin, 50px) + 4px) * 7);
    margin-top: 10px;
    background-color: #393939;
    padding: 10px;
  }
  .rack > * {
    margin: 2px;
  }  

</style>
