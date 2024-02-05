import { ProofData } from "@noir-lang/noir_js";
import { Fr } from "@aztec/bb.js";
declare global {
    interface Window {
        otplib: any;
    }
}
export declare class NoirOTP {
    secret: string;
    step: number;
    period: number;
    initial_epoch: number;
    authenticator: any;
    otpNodes: string[];
    constructor(authenticator: any);
    initialize(): Promise<string>;
    initAuthenticator(): Promise<void>;
    generateSecret(): Promise<void>;
    generateOTPNodesAndRoot(): Promise<string>;
    getQRCode(_user_id: string): Promise<string>;
    getNode(_otp: number, _epoch: number): Promise<Fr>;
    calcuTimestep(_epoch: number): number;
    getCurrentTimestep(): number;
}
export declare function getNullifier(leaf: string, otp: string, timestep: string): Promise<string>;
export declare function generateOTPProof(root: string, nullifier: string, index: string, hash_path: string[], otp: string, timestep: string): Promise<ProofData>;
export declare function calculateDepth(numLeaves: number): number;
export declare function padAndConvertToHexStr(value: number): string;
