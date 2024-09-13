<script>
  export let id, letter, score, playerWordSubmittedStatusCss, isDisabled;
</script>

<div class="square {isDisabled ? 'isdisabled' : ''}">
  <div class="letter-space no-select">
    <span class="text-lg md:text-2xl">{letter.toUpperCase()}</span><sub class="text-xs">{score}</sub>
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

  .isdisabled{
    @apply bg-amber-100;
  }

	.letter-space {
    font-size: 2vmin;
    color: #707070;
  }

  
</style>
