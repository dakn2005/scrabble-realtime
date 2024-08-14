<script>
  export let letter;
</script>

<div class="square">
  <div class="letter-space no-select">
    {letter.toUpperCase()}
  </div>
</div>

<style>
  .square {
    height: calc(min(5vmin, 50px));
    width: calc(min(5vmin, 50px));
    border-radius: calc(min(5vmin, 50px) / 6.25);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FFF6EB;
	}

	.letter-space {
    font-size: 2vmin;
    color: #707070;
  }

  
</style>
