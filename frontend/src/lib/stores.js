import { writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

export let 
    socket = writable(null),
    settingsOpen = persisted('settingsOpen', false),
    chatsOpen = persisted('chatsOpen', false),
    userStore = persisted('userStore', {})
