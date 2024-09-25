<script>
  import { onMount } from "svelte";
  import { persisted } from "svelte-persisted-store";

  import { socket, userStore, messages } from "$lib/stores.js";

  let { username } = $userStore;

  // onMount(() => {
  //   if (document.getElementById("chats-container"))
  //     document.getElementById("chats-container").scrollTop = 0; //document.getElementById("chats-container")?.scrollHeight;
  // });

  // // $: if ($socket){
  //   $socket.on("receive_message", (data) => {  
  //     $messages = [
  //       ...$messages,
  //       {
  //         message: data.message,
  //         username: data.username,
  //         __createdtime__: data.__createdtime__,
  //       },
  //     ];
      
  //     if (document.getElementById("chats-container")) 
  //       document.getElementById("chats-container").scrollTop = document.getElementById("chats-container")?.scrollHeight;
  //   });
  // // }
  

  // $socket.on("all_msgs", (allMsgs) => {
  //   // console.log('All messages:', JSON.parse(allMsgs));
  //   // allMsgs = JSON.parse(allMsgs);
  //   // Sort these messages by __createdtime__

  //   messages = [...messages, allMsgs];

  //   messages.sort((a, b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__));
  // });

  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
</script>

{#if !$messages || $messages.length === 0}
  <div class="hero bg-base-200" style="height: 80vh;">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <!-- <h1 class="text-5xl font-bold">Chats</h1> -->
        <p class="py-6">Write your first message</p>
        <!-- <button class="btn btn-primary">Get Started</button> -->
      </div>
    </div>
  </div>
{:else}
  <div id="chats-container" style="max-height: 80vh; overflow: scroll;">
    {#each $messages as msg}
      <div class="chat {username == msg.username ? 'chat-end' : 'chat-start'}">
        <div class="chat-bubble">
          <p>
            <span class="justify-start text-xs">
              {msg.username}
            </span>
            <span class="justify-end text-xs text-slate-400">
              {formatDateFromTimestamp(msg.__createdtime__)}
            </span>
          </p>

          {msg.message}
        </div>
      </div>
    {/each}
  </div>
{/if}
