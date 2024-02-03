## NoirOTP

NoirOTP is a zkTOTP(Time-based one-time password) scheme leveraging Noir, a DSL for writing zero-knowledge proof circuits. It lets the user pre-generate hundreds of thousands of TOTPs from a randomly generated secret and timestamps. These TOTPs construct a Merkle tree whose root is stored on-chain. Whenever users need to authenticate themselves, they must generate a Merkle-inclusion proof of the TOTPs off-chain, and the proof verification is carried out on-chain.

### Deploy

run forked goerli chain

```shell
forge script script/Deploy.s.sol:Deploy --rpc-url scroll-sepolia --broadcast --legacy
```
