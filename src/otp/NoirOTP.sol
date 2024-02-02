pragma solidity ^0.8.20;

import {IUltraVerifier} from "../interfaces/IUltraVerifier.sol";

contract NoirOTP {
    error PROOF_VERIFICATION_FAILED();

    bytes32 public merkleRoot;
    address public verifier;
    uint16 public step;

    mapping(bytes32 => bool) public nullifiers;

    constructor() {}

    function initalzieNoirOTP(
        address _verifier,
        bytes32 _merkleRoot,
        uint16 _step
    ) internal {
        verifier = _verifier;
        merkleRoot = _merkleRoot;
        step = _step;
    }

    function verifyOTP(
        bytes memory proof,
        bytes32 _nullifierHash
    ) internal returns (bool) {
        require(!nullifiers[_nullifierHash], "DUPLICATED_NULLIFIER");

        uint timestep = block.timestamp / step;

        bytes32[] memory publicInputs = new bytes32[](3);
        publicInputs[0] = _nullifierHash;
        publicInputs[1] = merkleRoot;
        publicInputs[2] = bytes32(timestep);

        if (!IUltraVerifier(verifier).verify(proof, publicInputs)) {
            revert PROOF_VERIFICATION_FAILED();
        } else {
            nullifiers[_nullifierHash] = true;
            return true;
        }
    }
}
