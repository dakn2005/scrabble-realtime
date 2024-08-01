<script>
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  import Tile from "./Tile.svelte";
  import Square from "./Square.svelte";

  let idx = 0;

  let items = [], tile_items = [];

  let lettersBag = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", 
      "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  let lettersScores = {
    1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    2: ["D", "G"],
    3: ["B", "C", "M", "P"],
    4: ["F", "H", "V", "W", "Y"],
    5: ["K"],
    8: ["J", "X"],
    10: ["Q", "Z"],
  };

  

  function handleDnd(e) {
    items = e.detail.items;
  }

  const boardGrid = Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => ({ id: j })));

  const flipDurationMs = 300;

  $: options = {
    items,
    flipDurationMs,
    morphDisabled: true,
  };
</script>

<div class="game-container">
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
  <div class="rack" use:dndzone="{options}" on:finalize="{handleDnd}" on:consider="{handleDnd}">
    {#each tile_items as item (item.id)}
      <div animate:flip="{{ duration: flipDurationMs }}">
        <Tile letter="{item.letter}" />
      </div>
    {/each}
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
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #272727;
    /* background-color: #fffae8; */
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
    justify-content: flex-start;
    flex-grow: 0;
    /* width: calc((min(5vmin, 50px) + 4px) * 7); */
    margin-top: 10px;
    background-color: #393939;
    padding: 10px;
  }
  .rack > * {
    margin: 2px;
  }
</style>
