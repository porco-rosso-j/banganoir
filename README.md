## Banganoir

Banganoir is an ERC4337 Wallet controlled by your Aadhaar identity, which integrates NoirOTP to provide an additional layer of security for your funds.

### [Anon Aadhaar](https://github.com/anon-aadhaar/anon-aadhaar)

_Anon Aadhaar is a zero-knowledge protocol that allows Aadhaar ID owners to prove their identity in a privacy preserving way. It provides a set of tools to generate and verify proofs, authenticate users and verify proofs on-chain._

Banganoir Wallet stores the hash of user Data, which can be retrieved from Aadhaar's secure QR code. The raw user data is a private input of proving and on-chain verification is carried out with the hash as one of the public inputs in `AnonAadhaarGroth16Verifier.verifyProof()`. Also, the function has another parameter called `signalHash`, the hash of `userOpHash` which is passed as a comittment to help mitigate on-chain front-running. This can be seen as a form of transaction signature that provides security and integrity of transactions for Banganoir Wallet.

### [ERC4337](https://eips.ethereum.org/EIPS/eip-4337)

Banganoir Wallet integrates [Pimlico](pimlico.io)'s ts library called `permissionless.js` and bundler to create user operation and broadcast transaction to scroll sepolia network.

### NoirOTP

NoirOTP is a zk-powered TOTP(Time-based one-time password) solution compatible with any authenticator app, e.g. Google Authenticator. It leverages Noir, a DSL for writing zero-knowledge proof circuits.

Unlike common OTP schemes where both a user and website have to securely store a shared secret used to generate a corresponding OTP at a given authentication time, NoirOTP does't let the website but only the user to keep the secret in their Authenticator app, more specifically, secure storage in their local device. The secret key is discarded immediately after the initial setup in which the secret is randomly generated to create TOTP hashes and a merkle tree and registered on the user's Authenticator app through QR code scan.

The TOTP hashes and the merkle tree mentioned above play a crucial role in authentication. The TOTP hashes are created out of pre-generated TOTPs using the secret and timestamps during the initial setup. The hashes are nodes of the Merkle Tree, and its merkle root is stored on-chain and will be used for authentications happening in the future.

Whenever an authentication is needed, the user opens their Authenticator App to get a 6-digit password and provide it with the website. With the given otp and the timestamp at that time, a Merkle-inclusion proof of the TOTP hash (`pedersenHash(otp, time)`), is generated off-chain with `noir_js`, and the proof verification is carried out on-chain.

It's worth noting that all the generated TOTP hashes must be stored somewhere as they are needed to obtain parameters of the proof generation, such as `hash_path` and `index` (of the given leaf node). To address this, TOTP hashes are stored on IPFS network through Pinata's Javascript API at the intial setup, and they are retrived to generate a Merkle-inclusion proof off-chain at every authentication. For the current setup that creates 64 TOTP hashes that can cover about 3.5 hrs of authentication, it is reasonable to store it on cheaper and immutable off-chain storage instead of neither smart contract nor browser storage.

This way, it not only replicates the role of websites do in the current TOTP scheme on-chain without storing secret on smart contract but also eliminates trusted intermediately, which is a remote server hosted by counterparty websites. But except for a few drawbacks described below, there is not big differences in UX between the conventional TOTP and NoirOTP solutions from the user point of view.

## Deployed on Scroll Sepolia

| Contract               | Address                                    |
| ---------------------- | ------------------------------------------ |
| Account Factory        | 0xE3c79375aAE1C7E94D98F2dC6457aCa8fA0C9A47 |
| Account Implementation | 0x04De5F6B51C944ABd14C1b5D20bcB56856c08176 |
| AnonAadhaar(Test)      | 0x388b96C6287BFa8c2Ba0da8E865fE003EDBf762A |

## Challenges

- proving time vs timestep
- verification cost
- the use of timestamp in on-chain verification while it's forbidden in 4337 tx.
- difficulties of 4337 on scroll

## Development

1. download necessary files for AnonAadhaar proving from links below and place them under frontend/public folder.

- [aadhaar-verifier.wasm](https://d1l6t78iyuhldt.cloudfront.net/aadhaar-verifier.wasm)
- [circuit_final.zkey](https://d1l6t78iyuhldt.cloudfront.net/circuit_final.zkey)
- [vkey.json](https://d1l6t78iyuhldt.cloudfront.net/vkey.json)

2. (Optional) deploy contract

```shell
forge script script/Deploy.s.sol:Deploy --rpc-url scroll-sepolia --broadcast --legacy
```

3. create `.env` file

```shell
cd frontend
cp .env.example .env
```

- you need [Pinata](https://app.pinata.cloud/register)'s API key and secret
- you need [pimlico](https://dashboard.pimlico.io/)'s api key

4. start frontend

```shell
cd frontend
yarn
yarn start
```
