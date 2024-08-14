<script>
  import { onMount } from "svelte";

  onMount(async () => {
    const resp = await fetch(url + "/api/rooms");
    const data = await resp.json();
    setKejas(data);
  });

  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", { username, room: room?.id });
    }
  };
</script>
