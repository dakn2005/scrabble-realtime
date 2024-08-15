<script>
  import { persisted } from "svelte-persisted-store";

  import { socket, userStore } from "$lib/stores.js";

  let { username } = $userStore;
  let messages = persisted("messages", []);

  // onDestroy(() => {
  //   $socket.off("receive_message");
  //   // socket.disconnect();
  // });

  $socket.on("receive_message", (data) => {

    $messages = [
      ...$messages,
      {
        message: data.message,
        username: data.username,
        __createdtime__: data.__createdtime__,
      },
    ];

  });

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

{#if !messages || messages.length === 0}
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
  {#each messages as msg}
    <div class="chat {username == msg.username ? 'chat-end' : 'chat-start'}">
      <div class="chat-bubble">
        <p>
          <span class="justify-start">
            {msg.username}
          </span>
          <span class="justify-end">
            {formatDateFromTimestamp(msg.__createdtime__)}
          </span>
        </p>

        {msg.message}
      </div>
    </div>
  {/each}
{/if}
