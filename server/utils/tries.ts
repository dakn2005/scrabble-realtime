import fs from 'fs';
import { IUser, TLetterBag } from '../interfaces';
import shuffle from './shuffle';

class TrieNode {
    end: boolean;
    children: Map<string, TrieNode>;

    constructor() {
        this.end = false;
        this.children = new Map<string, TrieNode>();
    }
}

// * if words are represented in correct order, suffixtree is deprecated -> this saves memory
export default class Trie {
    #prefixRoot: TrieNode = new TrieNode();
    // #suffixRoot: TrieNode = new TrieNode();

    #insertAbstract(wordArr: string[], root: TrieNode) {
        let node: TrieNode = root;
        // wordarr: string = word.split('');
        node.end = true;

        wordArr.forEach(element => {
            if (!node.children.get(element)) {
                node.children.set(element, new TrieNode());
            }

            node = node.children.get(element) as TrieNode
        });

        node.end = true
    }

    insert(word: string): void {
        this.#insertAbstract(word.toLowerCase().split(''), this.#prefixRoot);
        // this.#insertAbstract(word.split('').reverse(), this.#suffixRoot);
    }

    #searchAbstract(word: string, root: TrieNode): boolean {
        let node: TrieNode = root
        let found: boolean = false;
        let lgth: number = word.length;

        word.split('').forEach((element, i) => {
            if (node.children.get(element)){
                node = node.children.get(element) as TrieNode
                if (node.end && (i == lgth - 1))
                    found = true;
            }
            else{
                found = false;
            }
        });

        return found;
    }

    search(word: string): boolean {
        return this.#searchAbstract(word.toLowerCase(), this.#prefixRoot) //|| this.#searchAbstract(word, this.#suffixRoot)
    }
}

let shengTrie = new Trie();
let engTrie = new Trie();
let swahiliTrie = new Trie();
const isAlpha = (str: string) => /^[a-zA-Z]*$/gi.test(str)
let shengLetters: string[] = []; //Set<string> = new Set();

// TODO: deprecated
let shengLetterSetter = (wrd: string) => {
    wrd.split('').forEach((element: string) => {
        if (isAlpha(element)) {
            shengLetters.push(element.toUpperCase())
        }
    });
}

const createLetterBag = (lettersDistribution: TLetterBag) => {
    let letterBag: string[] = [];
    Object.keys(lettersDistribution).forEach(key => {
        lettersDistribution[parseInt(key)].forEach(letter => {
            let cnter = parseInt(key)

            while (cnter > 0) {
                letterBag.push(letter)
                cnter--
            }
        });
    });

    return letterBag;
}

const initShengSwaLetterBag = () => {
    // return shuffle([...shengLetters])
    let lettersDistribution: TLetterBag = {
        2: ['Y', 'V'],
        3: ['G', 'B', 'L', 'T', 'S', 'W'],
        4: ['K', 'R', 'F', 'P'],
        6: ['U', 'C', 'H', 'D'],
        8: ['N', 'M', 'E'],
        9: ['O', 'I'],
        12: ['A'],
    }

    let letterBag: string[] = createLetterBag(lettersDistribution);

    //random picking
    return shuffle(letterBag);    
}

const initEnLetterBag = (): string[] => {

    let lettersDistribution: TLetterBag = {
        1: ['J', 'K', 'Q', 'X', 'Z'],
        2: ['B', 'C', 'F', 'H', 'M', 'P', 'V', 'W', 'Y'],
        3: ['G'],
        4: ['D', 'L', 'S', 'U'],
        6: ['N', 'R', 'T'],
        8: ['O'],
        9: ['A', 'I'],
        12: ['E'],
    }

    let letterBag: string[] = createLetterBag(lettersDistribution);

    //random picking
    return shuffle(letterBag);
}

let enLettersScores: TLetterBag = {
    1: ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"],
    2: ["D", "G"],
    3: ["B", "C", "M", "P"],
    4: ["F", "H", "V", "W", "Y"],
    5: ["K"],
    8: ["J", "X"],
    10: ["Q", "Z"],
  };

  let swaShengLettersScores: TLetterBag = {
    1: ['A', 'O', 'I', 'N', 'M','E'],
    2: ['U', 'C', 'H', 'D', 'L'],
    3: ['K', 'R', 'B', 'W'],
    4: ['F','P', 'S'],
    5: ['G', 'T'],
    8: ['V'],
    10: ['Y'],
  };

// load tries
fs.readFileSync('./utils/dictionaries/sheng.txt', 'utf8')
    .split('\n')
    .forEach(line => {
        let word = line.split('-')[0]
        word = word.trim()

        if (word.includes('/')) {
            word.split('/').forEach(wrd => {
                shengTrie.insert(wrd)
                shengLetterSetter(wrd)
            })
        } else {
            shengTrie.insert(word);
            shengLetterSetter(word)
        }
    });

fs.readFileSync('./utils/dictionaries/en.txt', 'utf8')
    .split('\n')
    .forEach(word => {
        if (word.trim().split('').length > 1) {
            engTrie.insert(word.trim())
        }
    });

fs.readFileSync('./utils/dictionaries/swahili.txt', 'utf8')
    .split('\n')
    .forEach(word => {
        if (word.trim().split('').length > 1) {
            swahiliTrie.insert(word.trim())
        }
    });

export { 
    shengTrie, 
    engTrie, 
    swahiliTrie, 
    initEnLetterBag, 
    initShengSwaLetterBag, 
    enLettersScores, 
    swaShengLettersScores
}