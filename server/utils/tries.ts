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

    #insertAbstract(wordArr: string[], root: TrieNode){
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
        this.#insertAbstract(word.split(''), this.#prefixRoot);
        // this.#insertAbstract(word.split('').reverse(), this.#suffixRoot);
    }

    #searchAbstract(word: string, root: TrieNode): boolean {
        let node: TrieNode = root

        word.split('').forEach(element => {
            if (node.children.get(element))
                node = node.children.get(element) as TrieNode
            else
                return false
        });

        return node.end;
    }

    search(word: string): boolean {
        return this.#searchAbstract(word, this.#prefixRoot) //|| this.#searchAbstract(word, this.#suffixRoot)
    }
}