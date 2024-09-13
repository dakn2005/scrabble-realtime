<script>
  import { onMount, onDestroy } from "svelte";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as Tabs from "$lib/components/ui/tabs";
  import io from "socket.io-client";
  import { Toaster } from "$lib/components/ui/sonner";

  import "../../app.css";
  import { socket, settingsOpen, chatsOpen, userStore, messages } from "$lib/stores.js";
  import { SOCKET_URL, LANGS } from "$lib/constants.js";

  import Board from "$components/board/Board.svelte";
  import Chat from "$components/chat/Index.svelte";
  import Hist from "$components/board/Hist.svelte";

  const { username, game } = $userStore;

  // onMount(() => {

  //   if (!$socket) {
  //     $socket = io.connect(SOCKET_URL, { transports: ["websocket", 'polling'] }); 

  //     // rejoin room - below not working!
  //     // if (username == "") {
  //     //   goto('/')
  //     // } else {
  //     //   $socket.emit("join_game", { username, game: game.name });
  //     // }
  //   }

  //   if (game.lang == LANGS.sheng) {
  //     // * moved to backend
  //     // (async () =>{
  //     //   let resp = await fetch(SOCKET_URL + "/api/games/trie?lang=sheng");
  //     //   let trie = await resp.json();
  //     //   // console.log(trie);
  //     // })()
  //   }

  //   $messages = [];
  // });
  
</script>



<!-- <button on:click={() => sideOpen = true}>Open</button> -->
<Board />
<!-- <label for="my-drawer" class="btn btn-primary">Side Menu</label> -->
<Toaster richColors position="bottom-center" closeButton />

<Sheet.Root bind:open="{$chatsOpen}">
  <!-- <Sheet.Trigger>Open</Sheet.Trigger> -->
  <Sheet.Content>
    <!-- <Sheet.Header> -->
      <!-- <Sheet.Title>Chat Room</Sheet.Title> -->
      <!-- <Sheet.Description>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</Sheet.Description> -->
    <!-- </Sheet.Header> -->

    <Tabs.Root value="account" class="w-full">
      <Tabs.List>
        <Tabs.Trigger value="chatting">Chats</Tabs.Trigger>
        <Tabs.Trigger value="historia">Turn History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="chatting">
        <Chat />
      </Tabs.Content>
      <Tabs.Content value="historia">
        <Hist />
      </Tabs.Content>
    </Tabs.Root>

  </Sheet.Content>
</Sheet.Root>
