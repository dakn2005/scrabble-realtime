import { writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

export let 
    socket = writable(null),
    settingsOpen = writable(false),
    chatsOpen =writable(false),
    userStore = persisted('userStore', {}),
    messages = persisted('messages', []),
    recoverTiles = persisted('recoverTiles', null);
