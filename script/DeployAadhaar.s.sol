pragma solidity ^0.8.17;

import {AnonAadaarVerify} from "../src/aadhaar/AnonAadaarVerify.sol";
import "forge-std/Script.sol";

contract Deploy is Script {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // https://github.com/anon-aadhaar/anon-aadhaar/blob/main/packages/contracts/deployed-contracts/scroll-sepolia.json
    // address public AnonAadhaarVerifierTest = 0x45199Aa9C90dC945D0710Ce6d5166F9fb8263f04;
    address public AnonAadhaarTest = 0xbe4ce954Cb0f6b51E86ADa0195055CfB502380Ad;
    uint public userDataHash = 17943245711284926419220771095930365430627837417315902048749925131112880570484;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        anonAadhaarVerify = new AnonAadaarVerify(AnonAadhaarTest, userDataHash);

        console.logString("factory");
        console.logAddress(address(anonAadhaarVerify));
    }
}
