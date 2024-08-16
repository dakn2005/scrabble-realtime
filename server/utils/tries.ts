import { boolean } from "drizzle-orm/mysql-core";

class TrieNode {
    end: boolean;
    children: Map<string, TrieNode>;

    constructor() {
        this.children = new Map();
        this.end = false;
    }
}

export default class Trie {
    root: TrieNode = new TrieNode();

    insert(word: string) {
        let node: TrieNode = this.root;
        // wordarr: string = word.split('');
        node.end = true;

        word.split('').forEach(element => {
            if (!node.children.get(element)) {
                node.children.set(element, new TrieNode());
            }

            node = node.children.get(element) as TrieNode
        });

        node.end = true
    }

    search(word: string) {
        let node: TrieNode = this.root;

        word.split('').forEach(element => {
            if (node.children.get(element))
                node = node.children.get(element) as TrieNode
            else
                return false
        });

        return node.end;
    }
}