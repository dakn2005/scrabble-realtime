<script>
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
  import { SOCKET_URL } from "$lib/constants.js";
  import { toast } from "svelte-sonner";

  let amount = 0,
    input_amount="",
    phone = "",
    loading = false;

  let socialat = "",
    socialat_name_handle = "",
    message = "";

  let socialDict = {
    twirra: '<i class="fa-brands fa-twitter"></i>',
    tiktok: '<i class="fa-brands fa-tiktok"></i>',
    insta: '<i class="fa-brands fa-instagram"></i>',
    linkedin: '<i class="fa-brands fa-linkedin"></i>',
  };

  function onPress(val) {
    amount = val;
  }

  $: input_amount = input_amount.replace(/[^0-9]/g, "");

  $: amount = input_amount;

  $: socialat_name_handle = socialat_name_handle.replace(/[^a-zA-Z0-9\.@_-\s]/g, "");

  $: message = message.replace(/[^a-zA-Z0-9\.@,_-\s\!\?]/g, "");

  async function callStk() {
    loading = true;

    let formatted_phone = phone.replace(/^0+/, "254").replace(/[^0-9]/g, "").replace(/\s/, "");

    const resp = await fetch(SOCKET_URL + "/api/coffee/mpesa", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ 
        amount, 
        phone: formatted_phone,
        socialat_name_handle,
        message,
        socialat,
      }),
    }).catch((err) => {
      toast.error("Couldn't communicate with the server");
      loading = false;
    });

    let aresp = await resp.json();

    if (aresp?.body?.response){
      if (aresp.body.response.status == "success") {
      toast.success(aresp.body.response.message, 5000);
    } else {
      toast.warning(aresp.body.response.message, 6500);
    }
  }else{
    toast.error('Server error', 6500);
  }

    loading = false;
  }
</script>

<div style="height: 100vh;" class="pt-20 bg-lime-50">

  <div class="card w-10/12 md:w-1/2 xl:w-1/3 shadow-xl m-auto">
    <div class="card-title justify-center">
      <div class="w-24 text-center">
        <DotLottieSvelte src="/coffee.lottie" background="transparent" speed="1" direction="1" playMode="normal" autoplay loop></DotLottieSvelte>
      </div>
    </div>
    <div class="card-body">
      <div class="flex flex-col w-full text-center mb-5">
        <span class="text-3xl">Buy David a Coffee</span>
        <div>
          <span class="badge badge-warning text-[8.3px] md:text-[10px]">
            You'll receive a push notification from &nbsp;<strong>CRAFTIT LTD</strong>
          </span>
        </div>
      </div>

      <div class="flex flex-col md:flex-row">
          <div class="space-x-2 w-full md:w-3/4">
            <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(100)}">100</button>
            <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(300)}">300</button>
            <button class="btn bg-lime-400 hover:bg-lime-500 rounded-lg" on:click="{() => onPress(500)}">500</button>
          </div>
          <div class="w-full mt-2 md:mt-0 md:w-1/4">
            <input type="text" class="w-2/4 bg-slate-100 md:w-24 input input-bordered rounded-md" bind:value="{input_amount}" />
          </div>
      </div>

      <input type="text" class="input input-bordered rounded-md text-sm" placeholder="Kenyan phone number (07...)" bind:value="{phone}" />

      <label class="input input-bordered rounded-md flex items-center gap-2">
        {#if socialat_name_handle.includes("@")}
          <div class="dropdown">
            <div tabindex="0" class="btn bg-transparent border-none shadow-none">{@html socialat.length > 0 ? socialDict[socialat] : '<i class="fa-brands fa-twitter"></i>'}</div>
            <ul tabindex="0" class="menu dropdown-content bg-base-100 rounded-box z-[1] w-fit p-2 shadow">
              {#each Object.keys(socialDict) as key}
                <li><button on:click="{() => (socialat = key)}">{@html socialDict[key]}</button></li>
              {/each}
             
            </ul>
          </div>
        {/if}
        <input type="text" class="text-sm" placeholder="Name or @ (optional)" bind:value="{socialat_name_handle}" />
      </label>

      <textarea class="textarea textarea-bordered rounded-md" placeholder="Message (optional)" bind:value="{message}"></textarea>

      <div class="card-actions justify-end">
        <button disabled="{!amount || amount < 100 || phone.length < 1 || phone.length > 10 || loading}" on:click="{() => callStk()}" class="btn btn-warning text-center">
          Support {#if amount > 0}(KES {amount}){/if}
          {#if loading}
            <span class="loading loading-spinner loading-xs"></span>
          {/if}
        </button>
      </div>
    </div>
  </div>
  <div class="card w-1/2 xl:w-1/3 m-auto mt-10 flex flex-row justify-end">
    <span class="text-xs mr-5 mt-5"> Powered by </span>
    <img src="/mpesa.png" alt="mpesa logo" width="50" height="75" />
  </div>
</div>
