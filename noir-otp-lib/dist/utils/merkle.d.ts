import { Barretenberg, Fr } from "@aztec/bb.js";
export interface IMerkleTree {
    root: () => Fr;
    proof: (index: number) => Promise<{
        root: Fr;
        pathElements: Fr[];
        pathIndices: number[];
        leaf: Fr;
    }>;
    insert: (leaf: Fr) => void;
}
export declare class MerkleTree implements IMerkleTree {
    readonly zeroValue: Fr;
    levels: number;
    storage: Map<string, Fr>;
    zeros: Fr[];
    totalLeaves: number;
    bb: Barretenberg;
    constructor(levels: number);
    initialize(defaultLeaves: Fr[]): Promise<void>;
    initializeFromRootAndLeaves(root: Fr, hashedLeaves: Fr[]): Promise<void>;
    getBB(): Promise<Barretenberg>;
    pedersenHash(left: Fr, right: Fr): Promise<Fr>;
    static indexToKey(level: number, index: number): string;
    getIndex(leaf: Fr): number;
    getLeave(index: number): string | undefined;
    getLeaves(): Promise<string[]>;
    getRoot(): Promise<string>;
    root(): Fr;
    proof(indexOfLeaf: number): Promise<{
        root: Fr;
        pathElements: Fr[];
        pathIndices: number[];
        leaf: Fr;
    }>;
    insert(leaf: Fr): Promise<void>;
    update(index: number, newLeaf: Fr, isInsert?: boolean): Promise<void>;
    private traverse;
}
