pragma solidity ^0.8.17;

import {UltraVerifier} from "../circuit/contract/otp/plonk_vk.sol";
import {NoirOTP} from "../src/otp/NoirOTP.sol";
import {AccountFactory} from "../src/accounts/4337/AccountFactory.sol";
import {Account} from "../src/accounts/4337/Account.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import "forge-std/Script.sol";

contract Deploy is Script {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    NoirOTP public noirOTP;
    AccountFactory public factory;
    Account public account;
    IEntryPoint public entryPoint = IEntryPoint(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);
    address verifier = 0xb60D7F7Ec0a92da8Deb34E8255c31AcE45Faedf4;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        // address verifier = address(new UltraVerifier());

        // console.logString("verifier");
        // console.logAddress(verifier);

       

        // noirOTP = new NoirOTP();

        // console.logString("noirOTP");
        // console.logAddress(address(noirOTP));
        

        factory = new AccountFactory(entryPoint, verifier);

        console.logString("factory");
        console.logAddress(address(factory));
        
        address accImp = address(factory.accountImplementation());
        console.logString("acc imp");
        console.logAddress(accImp);

        // account = new Account(entryPoint);

        // console.logString("account");
        // console.logAddress(address(account));
    }
}
