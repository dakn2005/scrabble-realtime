<script>
    import Messages from "./Messages.svelte";
    import SendMessage from "./SendMessage.svelte";

     export let username, room, socket;
</script>

<Messages {username} {room} {socket} />
<SendMessage {username} {room} {socket} />