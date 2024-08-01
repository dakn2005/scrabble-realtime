<script>
import "./app.css";
import Board from './components/Board.svelte';
</script>

<div class="drawer bg-black">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
	  <!-- Page content here -->
	  <label for="my-drawer" class="btn btn-primary drawer-button">Open drawer</label>
	</div>
	<div class="drawer-side">
	  <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
	  <Board />
	   Test
	</div>
  </div>