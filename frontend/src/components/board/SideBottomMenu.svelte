<script>
  import { goto } from "$app/navigation";
  import { settingsOpen, chatsOpen, socket, userStore, messages } from "$lib/stores.js";

  export let submit,
    pickTilesFunc,
    leaveGameFunc,
    passMeFunc,
    setToggleSideBar,
    disabled,
    isbottom = false;

  const { username, game } = $userStore;
</script>

<ul class="{isbottom ? 'md:invisible menu bottommenu' : 'hidden md:menu sidemenu mt-24 mb-auto'}">
  <li>
    <button on:click="{submit}" {disabled} class="{disabled ? 'disabled' : ''}">
      <i class="fa-solid fa-upload"></i>
      <span>submit</span>
    </button>
  </li>

  <!-- <div class="divider divider-horizontal"></div> -->

  <li>
    <button on:click="{passMeFunc}" {disabled} class="{disabled ? 'disabled' : ''}">
      <i class="fa-solid fa-forward-step"></i>
      <span>pass</span>
    </button>
  </li>

  <li>
    <button on:click="{pickTilesFunc}">
      <img src="scrabble-letter-small.png" alt="letter" width="16" height="16" />
      <span>pick tiles </span>
    </button>
  </li>

  <li>
    <button on:click="{() => ($settingsOpen = true)}">
      <img src="score.png" alt="letter" width="20" height="20" />
      <span>scores </span>
    </button>
  </li>

  <li>
    <!-- <label for="chat-drawer">chat</label> -->
    <button on:click="{() => ($chatsOpen = [true, 'historia'])}">
      <i class="fa-solid fa-clock-rotate-left"></i>
      <span>History</span>
    </button>
  </li>

  <li>
    <!-- <label for="chat-drawer">chat</label> -->
    <button on:click="{() => ($chatsOpen = [true, 'chatting'])}">
      <i class="fa-regular fa-comment-dots {$messages?.length ? 'animate-pulse' : ''}"></i>
      <span>Chat</span>
    </button>
  </li>

  <li>
    <button on:click={leaveGameFunc}>
      <i class="fa-solid fa-circle-xmark md:text-lg text-red-600"></i>
      <span>exit</span>
    </button>
  </li>

  {#if !isbottom}
    <li>
      <button on:click="{setToggleSideBar}">
        <div>
          <i class="fa-sharp fa-solid fa-angle-left"></i>
          <i class="fa-sharp fa-solid fa-chevron-right"></i>
        </div>
      </button>
    </li>
  {/if}
</ul>

<style lang="scss">
  /* side menu */
  ul.sidemenu {
    @apply bg-base-200 rounded-box h-fit ml-5 mr-5;
  }

  ul.sidemenu > li > button {
    @apply flex flex-col justify-center mt-2 mb-2 shadow-slate-200 shadow-md;
  }

  ul.sidemenu > li > button.disabled {
    @apply flex flex-col justify-center mt-2 mb-2 shadow-slate-200 shadow-md bg-slate-200 cursor-default;
  }

  ul.sidemenu > li > button > span {
    font-size: 9.5px;
  }
  /* bottom menu */
  ul.bottommenu {
    @apply menu-horizontal bg-base-200 rounded-box m-auto mt-14 mb-10 p-0;
  }

  ul.bottommenu > li > button {
    @apply flex flex-row-reverse p-2;
    font-size: 9.5px;
  }

  ul.bottommenu > li > button.disabled {
    @apply flex flex-row-reverse p-2 bg-slate-200 cursor-default;
    font-size: 9.5px;
  }

  ul.bottommenu > li > button > img {
    height: 15px;
    width: 15px;
  }
</style>
