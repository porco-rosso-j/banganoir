pragma solidity ^0.8.17;

import {AnonAadhaar} from "../src/aadhaar/scroll-sepolia-1.0.0/AnonAadhaar.sol";
import {VerifierTest} from "../src/aadhaar/scroll-sepolia-1.0.0/VerifierTest.sol";
import "forge-std/Script.sol";

contract Deploy is Script {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    VerifierTest public verifier;
     AnonAadhaar public anonAadhaar;

    // https://github.com/anon-aadhaar/anon-aadhaar/blob/v1.0.0/packages/contracts/test/const.ts
    uint public testPubKeyHash = 14283653287016348311748048156110700109007577525298584963450140859470242476430;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        // anonAadhaarVerify = new AnonAadhaarVerify(AnonAadhaarTest, userDataHash);
        verifier = new VerifierTest();
        anonAadhaar = new AnonAadhaar(address(verifier), testPubKeyHash);

        console.logString("anonAadhaar");
        console.logAddress(address(anonAadhaar));
    }
}
