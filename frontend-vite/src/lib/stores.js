import { writable } from 'svelte/store';

export let 
    settingsOpen = writable(false),
    chatsOpen = writable(false)
