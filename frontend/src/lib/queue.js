export default class Queue {
    items = {}
    frontIndex = 0
    backIndex = 0

    enqueue(item) {
        this.items[this.backIndex] = item
        this.backIndex++
        // return item + ' inserted'
    }
    dequeue() {
        const item = this.items[this.frontIndex]
        delete this.items[this.frontIndex]
        this.frontIndex++
        return item
    }
    peek() {
        return this.items[this.frontIndex]
    }
    get printQueue() {
        return this.items;
    }

    get printArray(){
        return Object.values(this.items);
    }

    get size(){
        return this.backIndex - this.frontIndex
    }

    clear() {
        this.items = {}
        this.frontIndex = 0
        this.backIndex = 0
    }
}