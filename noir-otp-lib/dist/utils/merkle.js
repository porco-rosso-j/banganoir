// @ts-ignore -- no types
import { Barretenberg, Fr } from "@aztec/bb.js";
export class MerkleTree {
    zeroValue = Fr.fromString("18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63");
    levels;
    storage;
    zeros;
    totalLeaves;
    bb = {};
    constructor(levels) {
        this.levels = levels;
        this.storage = new Map();
        this.zeros = [];
        this.totalLeaves = 0;
    }
    async initialize(defaultLeaves) {
        // this.bb = await Barretenberg.new(cpus().length);
        this.bb = await Barretenberg.new();
        // build zeros depends on tree levels
        let currentZero = this.zeroValue;
        this.zeros.push(currentZero);
        for (let i = 0; i < this.levels; i++) {
            currentZero = await this.pedersenHash(currentZero, currentZero);
            this.zeros.push(currentZero);
        }
        for await (let leaf of defaultLeaves) {
            await this.insert(leaf);
        }
    }
    // func to reinitialzie MerkleTree class with hashed nodes
    async initializeFromRootAndLeaves(root, hashedLeaves) {
        // this.bb = await Barretenberg.new(cpus().length);
        this.bb = await Barretenberg.new();
        // Set the provided root
        this.storage.set(MerkleTree.indexToKey(this.levels, 0), root);
        // Set the provided hashed leaves
        for (let i = 0; i < hashedLeaves.length; i++) {
            this.storage.set(MerkleTree.indexToKey(0, i), hashedLeaves[i]);
        }
        // Set intermediate hashed leaves
        for (let level = 1; level <= this.levels; level++) {
            for (let index = 0; index < hashedLeaves.length / Math.pow(2, level); index++) {
                const leftChild = this.storage.get(MerkleTree.indexToKey(level - 1, index * 2)) ||
                    this.zeros[level - 1];
                console.log("level: ", level);
                console.log("leftChild: ", leftChild);
                const rightChild = this.storage.get(MerkleTree.indexToKey(level - 1, index * 2 + 1)) ||
                    this.zeros[level - 1];
                console.log("rightChild: ", rightChild);
                const intermediateNode = await this.pedersenHash(leftChild, rightChild);
                console.log("intermediateNode: ", intermediateNode);
                this.storage.set(MerkleTree.indexToKey(level, index), intermediateNode);
            }
        }
        this.totalLeaves = hashedLeaves.length;
    }
    async getBB() {
        return this.bb;
    }
    async pedersenHash(left, right) {
        // let hashRes = await this.bb.pedersenHash([left, right], 0);
        let hashRes = await this.bb.pedersenHashWithHashIndex([left, right], 0);
        return hashRes;
    }
    static indexToKey(level, index) {
        return `${level}-${index}`;
    }
    getIndex(leaf) {
        for (const [key, value] of this.storage) {
            if (value.toString() === leaf.toString()) {
                return Number(key.split("-")[1]);
            }
        }
        return -1;
    }
    getLeave(index) {
        for (const [key, value] of this.storage) {
            if (key === MerkleTree.indexToKey(0, index)) {
                return value.toString();
            }
        }
    }
    async getLeaves() {
        let nodes = [];
        for (let i = 0; i < this.totalLeaves; i++) {
            nodes.push(this.getLeave(i));
        }
        return nodes;
    }
    async getRoot() {
        return this.root().toString();
    }
    root() {
        return (this.storage.get(MerkleTree.indexToKey(this.levels, 0)) ||
            this.zeros[this.levels]);
    }
    async proof(indexOfLeaf) {
        let pathElements = [];
        let pathIndices = [];
        const leaf = this.storage.get(MerkleTree.indexToKey(0, indexOfLeaf));
        if (!leaf)
            throw new Error("leaf not found");
        // store sibling into pathElements and target's indices into pathIndices
        const handleIndex = async (level, currentIndex, siblingIndex) => {
            const siblingValue = this.storage.get(MerkleTree.indexToKey(level, siblingIndex)) ||
                this.zeros[level];
            pathElements.push(siblingValue);
            pathIndices.push(currentIndex % 2);
        };
        await this.traverse(indexOfLeaf, handleIndex);
        return {
            root: this.root(),
            pathElements,
            pathIndices,
            leaf: leaf,
        };
    }
    async insert(leaf) {
        const index = this.totalLeaves;
        await this.update(index, leaf, true);
        this.totalLeaves++;
    }
    async update(index, newLeaf, isInsert = false) {
        if (!isInsert && index >= this.totalLeaves) {
            throw Error("Use insert method for new elements.");
        }
        else if (isInsert && index < this.totalLeaves) {
            throw Error("Use update method for existing elements.");
        }
        let keyValueToStore = [];
        let currentElement = newLeaf;
        const handleIndex = async (level, currentIndex, siblingIndex) => {
            const siblingElement = this.storage.get(MerkleTree.indexToKey(level, siblingIndex)) ||
                this.zeros[level];
            let left;
            let right;
            if (currentIndex % 2 === 0) {
                left = currentElement;
                right = siblingElement;
            }
            else {
                left = siblingElement;
                right = currentElement;
            }
            keyValueToStore.push({
                key: MerkleTree.indexToKey(level, currentIndex),
                value: currentElement,
            });
            currentElement = await this.pedersenHash(left, right);
        };
        await this.traverse(index, handleIndex);
        // push root to the end
        keyValueToStore.push({
            key: MerkleTree.indexToKey(this.levels, 0),
            value: currentElement,
        });
        keyValueToStore.forEach((o) => {
            this.storage.set(o.key, o.value);
        });
    }
    // traverse from leaf to root with handler for target node and sibling node
    async traverse(indexOfLeaf, handler) {
        let currentIndex = indexOfLeaf;
        for (let i = 0; i < this.levels; i++) {
            let siblingIndex;
            if (currentIndex % 2 === 0) {
                siblingIndex = currentIndex + 1;
            }
            else {
                siblingIndex = currentIndex - 1;
            }
            await handler(i, currentIndex, siblingIndex);
            currentIndex = Math.floor(currentIndex / 2);
        }
    }
}
