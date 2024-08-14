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
    }
}