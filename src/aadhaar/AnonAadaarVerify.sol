// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {IAnonAadhaar} from "@anon-aadhaar/contracts/interfaces/IAnonAadhaar.sol";

contract AnonAadhaarVerify {
    error PROOF_INVALID();
    address public anonAadhaarAddr;
    uint public userDataHash;

    mapping (uint => bool) public nullifiers;

    function _initializeAnonAadhaar(address _verifierAddr, uint _userDataHash) internal {
        anonAadhaarAddr = _verifierAddr;
        userDataHash = _userDataHash;
    }

    // /// @dev Check if the timestamp is more recent than (current time - 3 hours)
    // /// @param timestamp: msg.sender address.
    // /// @return bool
    // function isLessThan3HoursAgo(uint timestamp) public view returns (bool) {
    //     return timestamp > (block.timestamp - 3 * 60 * 60);
    // }

    /// @dev Register a vote in the contract.
    /// @param identityNullifier: Hash of last the 4 digits + DOB, name, gender adn pin code.
    /// @param timestamp: Timestamp of when the QR code was signed.
    /// @param signal: signal used while generating the proof, should be equal to msg.sender.
    /// @param groth16Proof: SNARK Groth16 proof.
    function verifyAnonAadhaar(uint identityNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof) public returns(bool) {
        require(!nullifiers[signal], "DUPLICATED_NULLIFIER");

        if(!IAnonAadhaar(anonAadhaarAddr).verifyAnonAadhaarProof(identityNullifier, userDataHash, timestamp, signal, groth16Proof)) {
            revert PROOF_INVALID();
        } else {
            nullifiers[signal] = true;
            return true;
        }
    }

}