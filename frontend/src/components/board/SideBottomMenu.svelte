<script>
  import { settingsOpen, chatsOpen } from "$lib/stores.js";

  export let isbottom = false, setToggleSideBar;
</script>

<ul class="{isbottom ? 'md:invisible menu bottommenu' : 'hidden md:menu sidemenu'} ">
  <li>
    <button>
      <i class="fa-solid fa-upload"></i>
      <span>submit</span>
    </button>
  </li>

  <!-- <div class="divider divider-horizontal"></div> -->

  <li>
    <button>
      <i class="fa-solid fa-forward-step"></i>
      <span>pass</span>
    </button>
  </li>

  <li>
    <button>
      <img src="scrabble-letter-small.png" alt="letter" width="16" height="16" />
      <span>pick tiles </span>
    </button>
  </li>

  <li>
    <!-- <label for="chat-drawer">chat</label> -->
    <button on:click="{() => ($chatsOpen = true)}">
      <i class="fa-regular fa-comment-dots"></i>
      <span>chats </span>
    </button>
  </li>

  <li>
    <button on:click="{() => ($settingsOpen = true)}">
      <img src="score.png" alt="letter" width="20" height="20" />
      <span>scores </span>
    </button>
  </li>
  {#if !isbottom}
    <li>
      <button on:click="{setToggleSideBar()}">
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
    @apply bg-base-200 rounded-box h-fit ml-5 mr-5 mt-auto mb-auto;
  }

  ul.sidemenu > li > button {
    @apply flex flex-col justify-center mt-2 mb-2 shadow-slate-200 shadow-md;
  }

  ul.sidemenu > li > button > span {
    font-size: 9.5px;
  }
  /* bottom menu */
  ul.bottommenu {
    @apply menu-horizontal bg-base-200 rounded-box m-auto mt-20 p-0;
  }

  ul.bottommenu > li > button {
    @apply flex flex-row-reverse p-2;
    font-size: 9.5px;    
  }

  ul.bottommenu > li > button > img {
    height: 15px;
    width: 15px;
  }
</style>
