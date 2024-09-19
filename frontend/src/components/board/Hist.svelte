<script>
  import daysjs from "dayjs";

  import { history, userStore } from "$lib/stores.js";

  let {game} = $userStore;


  $: if ($history){
    if (document.getElementById("hist-container")) 
      document.getElementById("hist-container").scrollTop = document.getElementById("hist-container")?.scrollHeight;
  }
</script>

<div id="hist-container" style="max-height: 80vh; overflow: scroll;">
  {#each $history as hist}
    <div class="flex flex-col border-b-2 border-slate-400 rounded-md shadow-sm m-3 p-4 bg-white md:w-80">
      <div class="flex flex-row justify-between">
        <span class="font-semibold text-sm">{hist.player}</span>
      </div>
      {#if hist.wordscore}
        {#each hist.wordscore as ws}
        <div class="flex flex-row justify-between bg-slate-100 p-2 text-sm">
          <a href={`google.com/search?q=${ws[0]}+${game.lang}+meaning`} target="_blank">{ws[0]} <i class="fa-solid fa-square-arrow-up-right text-xs"></i></a>
          <span></span>
          <span>{ws[1]}</span>
        </div>
        {/each}
      {/if}
      <span class="italic text-right w-full" style="font-size: 9.5px;">{daysjs(hist.masaa).format('DD,MMM  YYYY hh:mma')}</span>
    </div>
  {/each}
</div>
