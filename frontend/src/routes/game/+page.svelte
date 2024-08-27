<script>
  import { onMount, onDestroy } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import io from "socket.io-client";
  import { Toaster } from "$lib/components/ui/sonner";

  import "../../app.css";
  import { socket, settingsOpen, chatsOpen, userStore, messages } from "$lib/stores.js";
  import { SOCKET_URL, LANGS } from "$lib/constants.js";

  import Board from "$components/board/Board.svelte";
  import Chat from "$components/chat/Index.svelte";

  const { username, game } = $userStore;

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
  
</script>


<Toaster richColors position="bottom-center" closeButton />

<!-- <button on:click={() => sideOpen = true}>Open</button> -->
<Board />
<!-- <label for="my-drawer" class="btn btn-primary">Side Menu</label> -->

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
