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

let shengLetterSetter = (wrd: string) => {
    wrd.split('').forEach((element: string) => {
        if (isAlpha(element)) {
            shengLetters.push(element.toUpperCase())
        }
    });
}

const initShengLetterBag = () => {
    return shuffle([...shengLetters])
}

const initEnLetterBag = (): string[] => {
    let letterBag: string[] = [];

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

    Object.keys(lettersDistribution).forEach(key => {
        lettersDistribution[parseInt(key)].forEach(letter => {
            let cnter = parseInt(key)

            while (cnter > 0) {
                letterBag.push(letter)
                cnter--
            }
        });
    });

    //random picking
    return shuffle(letterBag);
}

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

export { shengTrie, engTrie, swahiliTrie, initEnLetterBag, initShengLetterBag }