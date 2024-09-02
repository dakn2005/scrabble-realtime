<script>
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  import { SOCKET_URL, LANGS } from "$lib/constants.js";
  import { userStore, socket } from "$lib/stores.js";

  let username, selectedgame;
  let newuname = "",
    newgamename = "",
    newgame_lang,
    games = [];
  let joining = false;

  let interval;

  onMount(() => {
    resetInterval();
  });
  
  onDestroy(() => {
    clearInterval(interval);
    // console.log(interval);
  });
  
  function resetInterval() {
    clearInterval(interval);

    const caller = async () => {
      const resp = await fetch(SOCKET_URL + "/api/games");
      games = await resp.json();
    };

    interval = setInterval(caller, 15000);
    caller();
  }


  const joinGame = (e) => {
    joining = true;

    let [gameName, gameLang] = selectedgame.split("|");

    if (gameName == "" || username == "") {
      toast.error("Please select a game and enter a username");
      joining = false;
    } else {
      let ustore = { username, game: { name: gameName, lang: gameLang } };
      $userStore = ustore;

      $socket.emit("join_game", { username: ustore.username, game: ustore.game });

      $socket.on("join_reply", (data) => {
        if (data.status == "fail") {
          toast.error(data.message);
          joining = false;
        } else if (data.status == "success") goto("/game");
      });
    }
  };

  const newGame = async (e) => {
    e.preventDefault();

    if (newuname == "" || newgamename == "") {
      toast.error("Please enter a username and game name");

      return;
    }

    username = newuname;
    newgamename = newgamename.charAt(0).toUpperCase() + newgamename.slice(1);
    selectedgame = `${newgamename}|${newgame_lang}`;

    try {
      const resp = await fetch(SOCKET_URL + "/api/games/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newgamename,
          created_by: username,
          lang: newgame_lang,
          use_scrabble_dictionary: use_en_scrabble_dict,
        }),
      });

      let res = await resp.json();
      if (res.status == "fail") {
        toast.warning(res.error);
      } else {
        // let gameObj = res.games.find((g) => g.name == newgame);
        // game = gameObj.id
        joinGame();
      }
    } catch (e) {
      toast.error("Error Communicating with the Server");
    }
  };

  let use_en_scrabble_dict = true;
</script>

<div class="w-full" style="background-color: #fbf7f6;">
  <div class="card bg-slate-700 w-96 shadow-xl p-10 space-y-5 m-auto mt-48">
    <span class="m-auto text-4xl uppercase text-white">Karibu</span>

    <label class="input input-bordered input-md flex items-center gap-2">
      <span class="text-xs text-indigo-200 italic"> username</span>
      <input type="text" class="grow" placeholder="e.g. Kimana" bind:value="{username}" />
    </label>

    <select class="select select-bordered select-md w-full max-w-xs" bind:value="{selectedgame}">
      <option value="">-- Select Game --</option>
      {#each games as game (game.id)}
        <option value="{game.name}|{game.lang}">{game.name} ({game.lang})</option>
      {/each}
    </select>

    <button class="btn btn-neutral w-full" style="width: 100%;" on:click="{joinGame}">
      Join Game
      <span class="loading loading-spinner loading-xs {joining ? 'visible' : 'invisible'}"></span>
    </button>

    <button class="btn btn-outline btn-warning w-full" style="width: 100%;" onclick="new_game_modal.showModal()">
      <i class="fa-solid fa-plus"></i> New Game
    </button>

    <!-- New Game -->
    <dialog id="new_game_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        <h3 class="text-lg font-bold mb-4">+ Add</h3>

        <label class="input input-bordered input-md flex items-center gap-2 mb-3">
          <span class="text-xs italic text-indigo-200">username</span>
          <input type="text" class="grow" placeholder="e.g. Kimana" bind:value="{newuname}" />
        </label>

        <label class="input input-bordered input-md flex items-center gap-2 mb-4">
          <span class="text-xs italic text-indigo-200">Game Name </span>
          <input type="text" class="grow text-lg" bind:value="{newgamename}" placeholder="unique game name" />
        </label>

        <select class="select select-bordered select-md w-full mb-4" bind:value="{newgame_lang}">
          <option>-- Select language --</option>
          {#each Object.values(LANGS) as lugha}
            <option value="{lugha}">{lugha}</option>
          {/each}
        </select>

        <!-- 
        {#if newgame_lang == LANGS.en}
          <label class="flex justify-center cursor-pointer gap-2 mt-3 mb-3">
            <span class="italic" style="font-size: 9px;">:-) permissive mode(english corpus)</span>
            <input type="checkbox" bind:checked="{use_en_scrabble_dict}" value="synthwave" class="toggle toggle-error" />
            <span class="italic" style="font-size: 9px;">:-| serious mode(scrabble dictionary)</span>
          </label>
        {/if} -->

        <form method="dialog">
          <button class="btn btn-primary w-full" style="width: 100%;" on:click="{newGame}"> Save </button>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</div>
