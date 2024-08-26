<script>
  import { onMount, onDestroy } from "svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Sheet from "$lib/components/ui/sheet";
  import io from "socket.io-client";
  import { Toaster } from "$lib/components/ui/sonner";
  import { goto } from "$app/navigation";

  import "../../app.css";
  import { socket, settingsOpen, chatsOpen, userStore, messages } from "$lib/stores.js";
  import { SOCKET_URL, LANGS } from "$lib/constants.js";

  import Board from "$components/board/Board.svelte";
  import Chat from "$components/chat/Index.svelte";

  const { username, game } = $userStore;

  let gamePlayers=[];
  let currentPlayer, pickedTiles;

  onMount(() => {

    if (!$socket) {
      $socket = io.connect(SOCKET_URL); 

      // rejoin room - below not working!
      // if (username == "") {
      //   goto('/')
      // } else {
      //   $socket.emit("join_game", { username, game: game.name });
      // }
    }

    if (game.lang == LANGS.sheng) {
      // * moved to backend
      // (async () =>{
      //   let resp = await fetch(SOCKET_URL + "/api/games/trie?lang=sheng");
      //   let trie = await resp.json();
      //   // console.log(trie);
      // })()
    }

    $messages = [];
  });

  $: if ($socket){

    $socket.on('ingame_players', data=>{
      gamePlayers = data
    });

    $socket.on('current_player', player => {
      currentPlayer = player
    });

    $socket.on("tiles_picked", (data) => {
      let idx = 0;

      if (pickedTiles.length == 7) return;

      data.forEach((t) => {
        pickedTiles.push({
          id: idx++,
          letter: t,
        });
      });
    });

  }
  
</script>


<Toaster richColors position="bottom-center" closeButton />

<!-- <button on:click={() => sideOpen = true}>Open</button> -->
<Board {currentPlayer} {pickedTiles} />
<!-- <label for="my-drawer" class="btn btn-primary">Side Menu</label> -->

<Drawer.Root bind:open="{$settingsOpen}">
  <!-- <Drawer.Trigger></Drawer.Trigger> -->
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>

    <!-- divider here -->
    <!-- users[scores] | tiles left | turn history |  -->
     <div class="flex flex-row">
      <div class="grid grid-cols-2 gap-3">
        {#each gamePlayers as player}
          <button class="btn {player.username == currentPlayer ? 'btn-success' : ''}">
            {player.username}
            <div class="badge">{0}</div>
          </button>
        {/each}
      </div>

      <div class="w-1/3"></div>
      <div class="w-1/3"></div>
     </div>

    <Drawer.Footer>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<Sheet.Root bind:open="{$chatsOpen}">
  <!-- <Sheet.Trigger>Open</Sheet.Trigger> -->
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Chat Room</Sheet.Title>
      <!-- <Sheet.Description>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</Sheet.Description> -->
    </Sheet.Header>

    <Chat />
  </Sheet.Content>
</Sheet.Root>
