//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

interface IAnonAadhaarGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata publicInputs
    ) external view returns (bool);
}

interface IAnonAadhaar {
    function verifyAnonAadhaarProof(
        uint identityNullifier, uint userNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof 
    ) external view returns (bool);
}

contract AnonAadhaar is IAnonAadhaar {
    address public verifier;
    uint256 public storedPublicKeyHash;

    constructor(address _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        storedPublicKeyHash = _pubkeyHash;
    }

    /// @dev Verifies that the public key received is corresponding with the one stored in the contract.
    /// @param _receivedpubkeyHash: Public key received.
    /// @return Verified bool
    function verifyPublicKeyHash(uint256 _receivedpubkeyHash) private view returns (bool) {
        return storedPublicKeyHash == _receivedpubkeyHash;
    }

    /// @dev Verifies the AnonAadhaar proof received.
    /// @param identityNullifier: Hash of last the 4 digits + DOB, name, gender adn pin code.
    /// @param userNullifier: Hash of the last 4 digits + photo.
    /// @param timestamp: Timestamp of when the QR code was signed.
    /// @param signal: Signal committed while genereting the proof.
    /// @param groth16Proof: SNARK Groth16 proof.
    /// @return Verified bool
    function verifyAnonAadhaarProof(
        uint identityNullifier, uint userNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof 
    ) public view returns (bool) {
        uint signalHash = _hash(signal);
        return IAnonAadhaarGroth16Verifier(verifier).verifyProof([groth16Proof[0], groth16Proof[1]], [[groth16Proof[2], groth16Proof[3]], [groth16Proof[4], groth16Proof[5]]], [groth16Proof[6], groth16Proof[7]], [identityNullifier, userNullifier, timestamp, storedPublicKeyHash, signalHash]);
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}