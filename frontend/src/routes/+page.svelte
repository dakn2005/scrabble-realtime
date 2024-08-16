<script>
  import io from "socket.io-client";

  import { socket } from "$lib/stores.js";
  import { SOCKET_URL } from "$lib/constants.js";

  import "../app.css";
  import Login from "$components/Login.svelte";

  $socket = io.connect(SOCKET_URL);
</script>

<Login />
