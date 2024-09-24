<script>
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
  import { SOCKET_URL } from "$lib/constants.js";
  import { toast } from "svelte-sonner";

  let amount = 0, input_amount, phone='0721151960', loading=false;

  function onPress(val) {
    amount = val;
  }

  $: amount = input_amount;


  async function callStk(){
    loading = true;

    let formatted_phone = phone.replace(/^0+/, '254').replace(/\s/, '')

    const resp = await fetch(SOCKET_URL + "/api/coffee/mpesa", {
      method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({amount, phone: formatted_phone})
    });

    let msg = await resp.json();

    if (msg.status == 'success'){
      toast.success(msg.message);
    }else{
      toast.warning(msg.message);
    }

    loading = false;
  }

</script>

<div style="height: 100vh; background-color: white;" class='pt-20'>
  <div class="card w-1/2 shadow-xl m-auto">
    <div class="card-body">

      <span class="flex flex-row justify-center w-full">
        <span class="text-3xl">Buy David a Coffee</span>
        <div class="w-12">
          <DotLottieSvelte src="/coffee.lottie" background="transparent" speed="1" direction="1" playMode="normal" autoplay loop></DotLottieSvelte>
        </div>
      </span>

      
      <div class="flex flex-row space-x-2">
        
        <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(100)}">100</button>
        <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(300)}">300</button>
        <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(500)}">500</button>
        <input type="text" class="w-24 input input-bordered rounded-sm" bind:value={input_amount} />
      </div>

      <input type="text" class="input input-bordered rounded-md" placeholder="phone number (07...)" bind:value={phone}>

      <div class="card-actions justify-end">
        <button disabled={!amount || amount < 100} on:click={() => callStk()} class="btn btn-primary text-center">
          Support {#if amount > 0}(KES {amount}){/if}
          {#if loading}
            <span class="loading loading-spinner loading-xs"></span>
          {/if}
        </button>
        
      </div>
    </div>
  </div>
</div>
