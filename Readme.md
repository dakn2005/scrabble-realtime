# Scrabble Game (Real Time)
### Introduction

This is a hobby project implementing scrabble in two languages: English, Swahili, and Sheng

### Installation Steps
1.  Clone/download the project
2. run installation scripts for the server and frontend folders. 
```
> cd frontend
> pnpm i
> pnpm dev
```

```
> cd server
> pnpm i
> pnpm run
```

For the development environment, run a tunneling client to expose your localhost e.g.

```
ngrok http 8000
```

The project includes concepts and technologies specified below


#### DSA Concepts
- Tries
- LRU

#### Technologies
- svelte dnd
- shadcn
- socket.io
- Typescript

### Resources

Dictionaries downloaded from:

- Swahili - https://github.com/Kalebu/kamusi

        recommended online dictionary - https://sw.glosbe.com/sw/sw

- Sheng -  https://kenyanmagazine.co.ke/200-sheng-words-and-their-meanings/

- English - Unix-based systems comes with their own english corpus -> goto /usr/share/dict


