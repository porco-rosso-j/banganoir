pragma solidity ^0.8.17;

import {UltraVerifier} from "../circuit/contract/otp/plonk_vk.sol";
import {NoirOTP} from "../src/otp/NoirOTP.sol";
import "forge-std/Script.sol";

contract Deploy is Script {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    NoirOTP public noirOTP;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        // address verifier = address(new UltraVerifier());

        // console.logString("verifier");
        // console.logAddress(verifier);

        noirOTP = new NoirOTP();

        console.logString("noirOTP");
        console.logAddress(address(noirOTP));
    }
}
