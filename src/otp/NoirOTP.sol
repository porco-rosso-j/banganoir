pragma solidity ^0.8.20;

import {IUltraVerifier} from "src/interfaces/IUltraVerifier.sol";

contract NoirOTP {
    error PROOF_VERIFICATION_FAILED();

    bytes32 public merkleRoot;
    address public verifier;
    uint16 public step;
    string public ipfsHash;

    mapping(bytes32 => bool) public nullifiers;
    uint public currentTimestep;

    function initalzieNoirOTP(
        address _verifier,
        bytes32 _merkleRoot,
        uint16 _step,
        string memory _ipfsHash
    ) internal {
        require(_verifier != address(0), "INVALID_VERIFIER_ADDRESS");
        require(_merkleRoot != bytes32(0), "INVALID_ROOT");
        require(_step != 0, "INVALID_STEP");
        require(
            keccak256(abi.encodePacked(_ipfsHash)) !=
                keccak256(abi.encodePacked("")),
            "INVALID_IPFS_HASH"
        );
        verifier = _verifier;
        merkleRoot = _merkleRoot;
        step = _step;
        ipfsHash = _ipfsHash;
    }

    function _updateRootAndIPFSHash(bytes32 _merkleRoot, string memory _ipfsHash) internal {
        require(_merkleRoot != bytes32(0), "INVALID_ROOT");
        require(
            keccak256(abi.encodePacked(_ipfsHash)) !=
                keccak256(abi.encodePacked("")),
            "INVALID_IPFS_HASH"
        );
        merkleRoot = _merkleRoot;
        ipfsHash = _ipfsHash;
    }

    function verifyOTP(
        bytes memory proof,
        bytes32 _nullifierHash,
        uint timestep
    ) public returns (bool) {
        require(!nullifiers[_nullifierHash], "DUPLICATED_NULLIFIER");

        bytes32[] memory publicInputs = new bytes32[](3);
        publicInputs[0] = merkleRoot;
        publicInputs[1] = _nullifierHash;
        publicInputs[2] = bytes32(timestep);

        if (!IUltraVerifier(verifier).verify(proof, publicInputs)) {
            revert PROOF_VERIFICATION_FAILED();
        } else {
            nullifiers[_nullifierHash] = true;
            currentTimestep = timestep;
            return true;
        }
    }

    function getTimestep() public view returns (uint) {
        return block.timestamp / step;
    }
}