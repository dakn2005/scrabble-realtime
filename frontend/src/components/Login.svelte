<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import { SOCKET_URL } from "$lib/constants.js";
  import { userStore } from "$lib/stores.js";
  import { Toaster } from "$lib/components/ui/sonner";
  import { toast } from "svelte-sonner";

  let username,
    game,
    newuname,
    newgame,
    games = [];

  onMount(async () => {
    const resp = await fetch(SOCKET_URL + "/api/games");
    games = await resp.json();
  });

  const joinGame = () => {
    // console.log(username, game)
    // return

    if (game == "" || username == "") {
      alert("Please select a game and enter a username");
    } else {
      $userStore = { username, game };
      goto("/game");
    }
  };

  const newGame = async () => {
    username = newuname;

    const resp = await fetch(SOCKET_URL + "/api/games/add", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newgame, created_by: username }),
    });

    let res = await resp.json();

    if (res.status == "fail") {
      toast.error(res.error);
    } else {
      let gameObj = res.games.find((g) => g.name == newgame);
      game = gameObj.id
      joinGame();
    }
  };
</script>

<Toaster />

<div class="w-full">
  <div class="card bg-slate-700 w-96 shadow-xl p-10 space-y-5 m-auto mt-48">
    <span class="m-auto text-4xl uppercase text-white">Karibu</span>

    <label class="input input-bordered input-md flex items-center gap-2">
      username
      <input type="text" class="grow" placeholder="e.g. Kimana" bind:value="{username}" />
    </label>

    <select class="select select-bordered select-md w-full max-w-xs" bind:value="{game}">
      <option>-- Select Game --</option>
      {#each games as game (game.id)}
        <option value="{game.id}">{game.name}</option>
      {/each}
    </select>

    <button class="btn btn-neutral w-full" style="width: 100%;" on:click="{joinGame}"> Join Game </button>

    <button class="btn btn-outline btn-warning w-full" style="width: 100%;" onclick="new_game_modal.showModal()">
      <i class="fa-solid fa-plus"></i> New Game
    </button>

    <dialog id="new_game_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">+ Add</h3>

        <label class="input input-bordered input-md flex items-center gap-2 mb-3">
          username
          <input type="text" class="grow" placeholder="e.g. Kimana" bind:value="{newuname}" />
        </label>

        <label class="input input-bordered input-md flex items-center gap-2 mb-4">
          <span class="text-xs">Game Name </span>
          <input type="text" class="grow text-lg" placeholder="..." bind:value="{newgame}" />
        </label>

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
