// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import {NoirOTP} from "src/otp/NoirOTP.sol";
import "./Enum.sol";

interface GnosisSafe {
    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation
    ) external returns (bool success);
}

contract SafeOTPModule is NoirOTP {
    string public constant NAME = "SafeOTP Module";
    string public constant VERSION = "0.1.0";

    constructor(address _verifier, bytes32 _merkleRoot, uint16 _step, string memory _ipfsHash) {
        initalzieNoirOTP(_verifier, _merkleRoot, _step, _ipfsHash);
    }

    /// @dev Allows to use the allowance to perform a transfer.
    /// @param safe The Safe whose funds should be used.
    /// @param to target contract
    /// @param data calldata
    /// @param proof noir otp proof
    /// @param nullifierHash nullifier
    function executeTx(
        GnosisSafe safe,
        address to,
        uint value,
        bytes memory data,
        bytes memory proof,
        bytes32 nullifierHash
    ) public {
        uint timestep = block.timestamp / step;
        require(verifyOTP(proof, nullifierHash, timestep), "OTP_VALIDATION_FAILED");

        require(
            safe.execTransactionFromModule(
                to,
                value,
                data,
                Enum.Operation.Call
            ),
            "FAILED_TO_EXECUTE_TX"
        );
    }
}
