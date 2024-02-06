import { Authenticator } from "./types/authenticator";
import { Noir, ProofData } from "@noir-lang/noir_js";
import { Fr } from "@aztec/bb.js";
export declare class NoirOTP {
    noir: Noir;
    authenticator: Authenticator;
    secret: string;
    step: number;
    period: number;
    initial_epoch: number;
    otpNodes: string[];
    constructor(noir: Noir, authenticator: Authenticator);
    initialize(): Promise<string>;
    initAuthenticator(): Promise<void>;
    generateSecret(): Promise<void>;
    generateOTPNodesAndRoot(): Promise<string>;
    getQRCode(_user_id: string): Promise<string>;
    getNode(_otp: string, _timestep: number): Promise<Fr>;
    generateOTPProof(root: string, otp: string, otpNodes: string[]): Promise<ProofData>;
    updateEpoch(): void;
    verifyOTP(_otp: string): boolean;
    calcuTimestep(_epoch: number): number;
}
export declare function getNullifier(leaf: string, otp: string, timestep: string): Promise<string>;
export declare function getDepth(numLeaves: number): number;
export declare function padToHexStr(value: string): string;
export declare function strToFrArray(array: string[]): Fr[];
export declare function frToStrArray(array: Fr[]): string[];
