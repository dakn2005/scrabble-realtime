<script>
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Sheet from "$lib/components/ui/sheet";

  import "../app.css";
  import { settingsOpen, chatsOpen } from "$lib/stores.js";

  import Board from "$components/Board.svelte";
</script>

<!-- <div class="drawer drawer-end">
  <input id="chat-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">Content here</div>
  <div class="drawer-side">
    <label for="chat-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
  </div>
</div> -->



<!-- <button on:click={() => sideOpen = true}>Open</button> -->
<Board />
<!-- <label for="my-drawer" class="btn btn-primary">Side Menu</label> -->

<Drawer.Root bind:open={$settingsOpen}>
  <!-- <Drawer.Trigger></Drawer.Trigger> -->
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>

    <!-- divider here -->
    <!-- users[scores] | tiles left | turn history |  -->

    <Drawer.Footer>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<Sheet.Root bind:open={$chatsOpen}>
  <!-- <Sheet.Trigger>Open</Sheet.Trigger> -->
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
      <Sheet.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Sheet.Description>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>

