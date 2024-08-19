<script>
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";

  import Tile from "./Tile.svelte";
  import SpecialTile from "./SpecialTile.svelte";

  export let row_id, tile_id, getLetterScore, proposedWordQueue, items = [];

  let isSpecial = false,
    tile_type = "";

  function considerDnd(e) {
    items = e.detail.items;
  }

  function finalizeDnd(e) {
    items = e.detail.items;
    
    // let value = e.target.getAttribute('data-item').split(',');
    if (items[0]){
      let scoremultiplier = scoreMultiplier();
      proposedWordQueue(items[0].letter, [row_id, tile_id], scoremultiplier)
    }
  }

  // based on the board from: https://www.solitaireparadise.com/games_list/scrabble-online.html
  // also checkout the board: https://playscrabble.com/play/ai
  let special_tiles = {
    0: {
      3: "dw",
      6: "tl",
      8: "tl",
      11: "dw",
    },
    1: {
      2: "dl",
      5: "dw",
      9: "dw",
      12: "dl",
    },
    2: {
      1: "dl",
      4: "dl",
      10: "dl",
      13: "dl",
    },
    3: {
      0: "tw",
      3: "tl",
      7: "dw",
      11: "tl",
      14: "tw",
    },
    4: {
      2: "dl",
      4: "dw",
      10: "dw",
      12: "dl",
    },
    5: {
      1: "dw",
      5: "tl",
      9: "tl",
      13: "dw",
    },
    6: {
      0: "tl",
      6: "dl",
      8: "dl",
      14: "tl",
    },
    7: {
      3: "dw",
      7: "m",
      11: "dw",
    },
  };

  function scoreMultiplier() {
    let mapper = special_tiles[row_id] || special_tiles[14 - row_id];
    let squareScore = 1;

    if (mapper && mapper[tile_id]) {
      switch (mapper[tile_id]) {
        case "tw":
        case "tl":
           squareScore = 3
        case "dw":
        case "dl":
        case "m":
          squareScore = 2
      }
    }

    return [squareScore, mapper[tile_id]];
  }

  $: if (row_id || tile_id) {
    let mapper = special_tiles[row_id] || special_tiles[14 - row_id];

    if (mapper && mapper[tile_id]) {
      isSpecial = true;
      tile_type = mapper[tile_id];
    }
  }

  $: options = {
    dropFromOthersDisabled: items.length,
    items,
    dropTargetStyle: {},
    flipDurationMs: 100,
  };

  // $: console.log(items)
</script>

<!-- data-item="{row_id}, {tile_id}"  -->
<div class="square-design square-size" use:dndzone="{options}" on:consider="{considerDnd}" on:finalize="{finalizeDnd}" style="{items?.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME]) ? 'background: rgba(255, 255, 255, 0.2)' : ''}">
  {#if items.length == 0 && isSpecial}
    <SpecialTile {tile_type} />
  {:else}
    {#each items as tile (tile.id)}
      <Tile letter="{tile.letter}" score={getLetterScore(tile.letter)} />
    {/each}
  {/if}
</div>

<style>
  .square-design {
    border: 2px solid #272727;
    background-color: #393939;
  }

  /* .square-design-dw {
    border: 2px solid #272727;
    background-color: red;
  } */

  .square-size {
    height: calc(2px + min(5vmin, 50px));
    width: calc(2px + min(5vmin, 50px));
    border-radius: calc(min(5vmin, 50px) / 6.25);
  }
</style>
