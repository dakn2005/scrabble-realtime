<!-- <p class="text-center mb-8">Scroll down on the Show Code tab to see the <code class="bg-white p-2 rounded-lg">tailwind.config.js</code> custom code and the <code class="bg-white p-2 rounded-lg">final component</code> syntax for accomplishing this result.</p> -->
<script>
    export let isloading;
</script>

{#if isloading}
<div class='w-full'>
      <div class='h-1.5 w-full bg-pink-100 overflow-hidden'>
        <div class='progress w-full h-full bg-sky-300 left-right'></div>
      </div>
</div>
{/if}

<style>
/* You must add these custom styles below to your tailwind.config.js file 
 Right below are the syntax for doing that using tailwind.config.js 
 You can also check the docs on this https://tailwindcss.com/docs/animation 


tailwind.config.js Syntax

theme : {
    extend: {
        animation: {
        progress: 'progress 1s infinite linear',
      },
      keyframes: {
        progress: {
          '0%': { transform: ' translateX(0) scaleX(0)' },
          '40%': { transform: 'translateX(0) scaleX(0.4)' },
          '100%': { transform: 'translateX(100%) scaleX(0.5)' },
        },
      },
      transformOrigin: {
        'left-right': '0% 50%',
      }
    }

}

Tailwind component Syntax

<div className='w-full'>
      <div className='h-1.5 w-full bg-pink-100 overflow-hidden'>
        <div className='animate-progress w-full h-full bg-pink-500 origin-left-right'></div>
      </div>
</div>

*/

.progress {
  animation: progress 1s infinite linear;
}

.left-right {
    transform-origin: 0% 50%;
}
    @keyframes progress {
    0% {
        transform:  translateX(0) scaleX(0);
    }
    40% {
        transform:  translateX(0) scaleX(0.4);
    }
    100% {
        transform:  translateX(100%) scaleX(0.5);
    }
}
</style>