// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./Account.sol";

/**
 * A sample factory contract for SimpleAccount
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
contract AccountFactory is Ownable {
    Account public immutable accountImplementation;
     address public anonAadhaarVerifierAddr;
    address public noirOTPVerifier;
    

    constructor(IEntryPoint _entryPoint, address _anonAadhaarVerifierAddr, address _noirOTPVerifier) {
        accountImplementation = new Account(_entryPoint);
        anonAadhaarVerifierAddr = _anonAadhaarVerifierAddr;
        noirOTPVerifier = _noirOTPVerifier;
        
    }

    function setNoirOTPVerifier(address _noirOTPVerifier) public onlyOwner {
        noirOTPVerifier = _noirOTPVerifier;
    }

    function setAnonAadhaarVerifierAddr(address _anonAadhaarVerifierAddr) public onlyOwner {
         anonAadhaarVerifierAddr = _anonAadhaarVerifierAddr;
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(
        uint _userDataHash,     
        bytes32 _merkleRoot,
        uint16 _step,
        string memory _ipfsHash,
        uint256 salt
    ) public returns (Account ret) {
        address addr = getAccountAddress(_userDataHash, _merkleRoot, _step, _ipfsHash, salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return Account(payable(addr));
        }
        ret = Account(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation),
                    abi.encodeCall(
                        Account.initialize,
                        (anonAadhaarVerifierAddr, _userDataHash, noirOTPVerifier, _merkleRoot, _step, _ipfsHash)
                    )
                )
            )
        );
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAccountAddress(
        uint _userDataHash,     
        bytes32 _merkleRoot,
        uint16 _step,
        string memory _ipfsHash,
        uint256 salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(accountImplementation),
                            abi.encodeCall(
                                Account.initialize,
                                (anonAadhaarVerifierAddr, _userDataHash, noirOTPVerifier, _merkleRoot, _step, _ipfsHash)
                            )
                        )
                    )
                )
            );
    }
}
