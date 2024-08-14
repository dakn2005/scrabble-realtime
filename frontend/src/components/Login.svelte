<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  export let url;

  let username,
    game,
    newgame,
    games = [];

  onMount(async () => {
    const resp = await fetch(url + "/api/games");
    games = await resp.json();
  });

  const joinGame = () => {
    if (game !== "" && username !== "") {
      socket.emit("join_game", { username, room: game?.id });
      goto("/game");
    }
  };

  const newGame = async () => {
    const resp = await fetch(url + "/api/games/add", {
      method: "POST",
      body: JSON.stringify({ name: newgame, created_by: username }),
    });
    games = await resp.json();
  }
</script>


<div class="w-full">
  <div class="card bg-slate-700 w-96 shadow-xl p-10 space-y-5 m-auto mt-48">
    <span class="m-auto text-4xl uppercase text-white">Karibu</span>

    <label class="input input-bordered input-md flex items-center gap-2">
      username
      <input type="text" class="grow" placeholder="Kimana" bind:value="{username}" />
    </label>

    <select class="select select-bordered select-md w-full max-w-xs">
      <option>-- Select Game --</option>
      {#each games as game (game.id)}
        <option value="{game.id}">{game.name}</option>
      {/each}
    </select>

    <button class="btn btn-neutral w-full" style="width: 100%;" on:click="{joinGame}"> Join Game </button>

    <button class="btn btn-outline btn-warning w-full" style="width: 100%;" onclick="my_modal_2.showModal()">
      <i class="fa-solid fa-plus"></i> New Game
    </button>

    <dialog id="my_modal_2" class="modal">
      <div class="modal-box">

        <h3 class="text-lg font-bold mb-4">+ Add</h3>

        <label class="input input-bordered input-md flex items-center gap-2 mb-4">
          <span class="text-xs">Name of the Game </span>
          <input type="text" class="grow text-lg" placeholder="..." bind:value="{newgame}" />
        </label>

        <button class="btn btn-primary w-full" style="width: 100%;" on:click="{newGame}"> Save </button>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

  </div>
</div>
