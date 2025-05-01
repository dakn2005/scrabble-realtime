# [Realtime Scrabble Game](https://scrabble-ke.onrender.com/)
### Introduction

This is a hobby project implementing a realtime scrabble game in 3 languages: English, Swahili, and Sheng (East African)

### Motivation
Got to revisit some comp sci concepts as detailed below, using these to create a scrappy PoC during the holidays for the fam(ily). Read the [article here](https://medium.com/@keymannerdawid/swahili-scrabble-d5586fabd543) for more details

#### Concepts
- Tries (prefix trees)
- LRUs
- Matrix Traversal
- sockets

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

The project includes concepts (above) and technologies specified below

#### Technologies
- svelte dnd
- shadcn
- socket.io
- Typescript

### Resources

****
- Swahili and Sheng
  - [Swahili CSV](https://github.com/Kalebu/kamusi)
  - [Swahililine dictionary](https://sw.glosbe.com/sw/sw)
  - Other
    - [Datascience projects](https://www.freecodecamp.org/news/african-language-datasets-for-data-science-projects/)

- [Sheng sample corpus](https://kenyanmagazine.co.ke/200-sheng-words-and-their-meanings/)

- English - Unix-based systems comes with their own english corpus -> goto /usr/share/dict


