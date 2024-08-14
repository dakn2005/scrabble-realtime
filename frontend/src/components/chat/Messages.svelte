<script>
  import { onMount, onDestroy } from "svelte";

  export let username, room, socket;

  let messages;

  onDestroy(() => {
    // socket.disconnect();
    socket.off("receive_message");
  });

  $: if (socket) {
    socket.on("receive_message", (data) => {
      // console.log('socket receive_message: ', data);

      messages = [
        ...messages,
        {
          message: data.message,
          username: data.username,
          __createdtime__: data.__createdtime__,
        },
      ];
    });

    socket.on("all_msgs", (allMsgs) => {
      // console.log('All messages:', JSON.parse(allMsgs));
      // allMsgs = JSON.parse(allMsgs);
      // Sort these messages by __createdtime__

      messages = [...messages, allMsgs];

      messages.sort((a, b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__));
    });
  }

  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
</script>

{#each messages as msg}
  <div class="chat chat-start">
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
