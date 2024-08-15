<script>
  import {  userStore, socket } from '$lib/stores.js'
  
  let { username, game } = $userStore
  let message;

  const sendMessage = () => {
    if (message !== "") {
      const __createdtime__ = Date.now();
      // console.log(username, game)
      // Send message to server. We can't specify who we send the message to from the frontend. We can only send to server. Server can then send message to rest of users in room
      $socket.emit("send_message", { username, game, message, __createdtime__ });

      message = "";
    }
  };
</script>

<div>
  <label class="input input-bordered flex items-center gap-2">
    <input
      placeholder="Message..."
      class="grow"
      bind:value="{message}"
      on:keydown="{(e) => {
        if (e.key == 'Enter') sendMessage();
      }}" />

    <button class="btn btn-sm btn-outline btn-primary" on:click="{sendMessage}">
      <i class="fa-regular fa-paper-plane"></i>
    </button>
  </label>

 
</div>
