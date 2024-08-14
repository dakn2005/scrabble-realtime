<script>
    export let username, room, socket;
    let message;

    const sendMessage = () => {
    if (message !== '') {
      const __createdtime__ = Date.now();
      // Send message to server. We can't specify who we send the message to from the frontend. We can only send to server. Server can then send message to rest of users in room
      socket.emit('send_message', { username, room, message, __createdtime__ });
      setMessage('');
    }
  };
</script>

<div>
    <input
      
      placeholder='Message...'
      bind:value="{message}"
      
      on:keydown={e=>{
      
        if (e.key == 'Enter') sendMessage()
      }}
     
    />

    <button class='btn btn-primary' onClick={sendMessage}>
      Send Message
    </button>
  </div>