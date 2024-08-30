<script>
  export let tile_type;
</script>

<div class="square square-{tile_type}">
  <div class="letter-space no-select">
    {#if tile_type == 'm'}
      &#9734;
    {:else}
      {tile_type.toUpperCase()}
    {/if}
  </div>
</div>

<style>
    .square{
        height: calc(min(5vmin, 50px));
        width: calc(min(5vmin, 50px));
        border-radius: calc(min(5vmin, 50px) / 6.25);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .square-dw {
        background-color: #b96564;
      }
      
      .square-dl{
        background-color: #516685;
        
      }
      
      .square-tl{
        background-color: #182f6c;
      }
      
      .square-tw{
        background-color: #7d1f15;
      }

      .square-m{
        background-color: #7d1f15;
      }
      
      .letter-space {
        font-size: 2vmin;
        /* color: #707070; */
        color: #fff;
  }
</style>
