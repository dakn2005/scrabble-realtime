<script>
  import { onMount } from "svelte";
  import daysjs from "dayjs";

  import { history } from "$lib/stores.js";

  onMount(() => {
    if (document.getElementById("hist-container")) document.getElementById("hist-container").scrollTop = document.getElementById("hist-container")?.scrollHeight;
  });
</script>

<div id="hist-container" style="max-height: 80vh; overflow: scroll;">
  {#each $history as hist}
    <div class="flex flex-col border-b-2 border-slate-400 rounded-md shadow-sm m-3 p-4 bg-white md:w-80">
      <div class="flex flex-row justify-between">
        <span class="font-semibold">{hist.player}</span>
      </div>
      {#each hist.wordscore as ws}
      <div class="flex flex-row justify-between bg-slate-100 p-2">
        <span>{ws[0]}</span>
        <span></span>
        <span>{ws[1]}</span>
      </div>
      {/each}
      <span class="italic float-right text-xs">{daysjs(hist.masaa).format('dd-mm-yyyy hh:mm a')}</span>
    </div>
  {/each}
</div>
