pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "account-abstraction/core/BaseAccount.sol";
import "account-abstraction/samples/callback/TokenCallbackHandler.sol";
import "src/otp/NoirOTP.sol";
import "src/aadhaar/AnonAadhaarVerify.sol";

contract Account is
    BaseAccount,
    UUPSUpgradeable,
    Initializable,
    TokenCallbackHandler,
    NoirOTP,
    AnonAadhaarVerify
{
    IEntryPoint private immutable _entryPoint;
    address public owner;

    modifier onlyEntryPoint() {
        require(msg.sender == address(_entryPoint), "only entrypoint");
        _;
    }

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }


    // modifier validateTimestep() {
    //     require(getTimestep() == currentTimestep, "INVALID_TIMESTEP");
    //     _;
    // }

    function _validateTimeValidity() internal {
         require(getTimestep() == currentTimestep, "INVALID_TIMESTEP");
         // require(isLessThan3HoursAgo(), "NOT_LESS_THAN_3H_AGO");
    }

    function _onlySelf() internal view {
        require(msg.sender == address(this), "ONLY_SELF");
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    event AccountInitialized(
        IEntryPoint indexed entryPoint,
        address indexed owner
    );

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function initialize(
        address _anonAadhaarVerifierAddr, 
        uint _userDataHash,
        address _noirOTPVerifier,
        bytes32 _merkleRoot,
        uint16 _step,
        string memory _ipfsHash
    ) public initializer {
        _initialize(address(0));
        _initializeAnonAadhaar(_anonAadhaarVerifierAddr, _userDataHash);
        initalzieNoirOTP(_noirOTPVerifier, _merkleRoot, _step, _ipfsHash);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit AccountInitialized(_entryPoint, owner);
    }

    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(
            msg.sender == owner || msg.sender == address(this),
            "only owner"
        );
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _validateTimeValidity();
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(
        address[] calldata dest,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
         _validateTimeValidity();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner,
            "account: not Owner or EntryPoint"
        );
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        (uint identityNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof, bytes memory proof, bytes32 nullifierHash, uint timestep) = abi.decode(
            userOp.signature,
            (uint, uint, uint, uint[8], bytes, bytes32, uint)
        );


        if (
            !verifyAnonAadhaar(identityNullifier, timestamp, signal, groth16Proof) || 
            !verifyOTP(proof, nullifierHash, timestep)) 
        return SIG_VALIDATION_FAILED;
        return 0;
    }

    // function validateSignature(
    //     UserOperation calldata userOp,
    //     bytes32 userOpHash
    // ) public returns (uint256 validationData) {
    //     (uint identityNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof, bytes memory proof, bytes32 nullifierHash, uint timestep) = abi.decode(
    //         userOp.signature,
    //         (uint, uint, uint, uint[8], bytes, bytes32, uint)
    //     );

    //     if (
    //         !verifyAnonAadhaar(identityNullifier, timestamp, signal, groth16Proof) || 
    //         !verifyOTP(proof, nullifierHash, timestep)) 
    //     return SIG_VALIDATION_FAILED;
    //     return 0;
    // }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        _onlyOwner();
    }
}
