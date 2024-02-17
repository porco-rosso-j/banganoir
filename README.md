## Banganoir

Banganoir is an ERC4337 Wallet controlled by your Aadhaar identity, which integrates NoirOTP to provide an additional layer of security for your funds.

### Anon Aadhaar

_Anon Aadhaar is a zero-knowledge protocol that allows Aadhaar ID owners to prove their identity in a privacy preserving way. It provides a set of tools to generate and verify proofs, authenticate users and verify proofs on-chain._

Banganoir Wallet stores the hash of user Data, which can be retrieved from Aadhaar's secure QR code. The raw user data is a private input of proving and on-chain verification is carried out with the hash as one of the public inputs in `AnonAadhaarGroth16Verifier.verifyProof()`.

Also, the function has another parameter called `signalHash`, the hash of `userOpHash` which is passed as a comittment to help mitigate on-chain front-running. This can be seen as a form of transaction signature that provides security and integrity of transactions for Banganoir Wallet.

[Anon Aadhaar Doc](https://github.com/anon-aadhaar/anon-aadhaar)

### ERC4337

Banganoir Wallet integrates [Pimlico](pimlico.io)'s ts library called `permissionless.js` and bundler to create user operation and broadcast transaction to scroll sepolia network.

[EIP4337](https://eips.ethereum.org/EIPS/eip-4337)

### NoirOTP

NoirOTP is a zk-powered trustless TOTP(Time-based one-time password) solution compatible with any authenticator app, e.g. Google Authenticator. It leverages Noir, a DSL for writing zkp circuits, to authenticate TOTPs through the verification of Merkle-inclusion proof.

#### Initial setup

During the initial setup, a secret key is randomly created to pre-generate numerous TOTPs that can cover the effective period of all the TOTPs, e.g. 30 days. These TOTPs are hashed to construct a Merkle tree whose each leave is the hash of a TOTP and timestep value.

- timestep: an incrementing value for each OTP ( = timestamp / step ).
- step: a valid period of each OTP. it's normally 30 seconds but set to 3 mins in NoirOTP.

Note that the secret key is only registered on the user's device, an Authenticator app through QR code scan, and discarded immediately, instead of being stored neither on-chain nor an external server.

#### Authentication

At an authentication, the user gets TOTP from Authenticator app and enters it on an app UI. Then, `noir_js` is used to execute & generate a Merkle-inclusion proof of the TOTP hash, where `root` is fetched from smart contract, and other necessary inputs, such as `hash_path[]` and `index` are computed using all the TOTP hashes stored on ipfs via Pinata.

And the proof is verified by NoirOTP contract where `timestep` as an public input is calculated with `block.timestamp` beforehand. In this approach, the functionality that websites perform in the conventional TOTP scheme can be emulated on-chain without storing the secret anywhere.

[Noir Doc](https://noir-lang.org/docs/)

## Deployed on Scroll Sepolia

| Contract               | Address                                    |
| ---------------------- | ------------------------------------------ |
| Account Factory        | 0xE3c79375aAE1C7E94D98F2dC6457aCa8fA0C9A47 |
| Account Implementation | 0x04De5F6B51C944ABd14C1b5D20bcB56856c08176 |
| AnonAadhaar(Test)      | 0x388b96C6287BFa8c2Ba0da8E865fE003EDBf762A |

## Challenges (WIP)

### AnonAadhaar

- Proving time
  Generating AnonAadhaar proof on browser currently takes 2-3mins. Most users, easpecially wallet users, wouldn't be so happy to wait such a long time at every tx.

### NoirOTP

- Time of generating TOTP hashes
  In the initial setup, pre-generating numerous TOTPs and constructing a merkle tree currently takes about 1 minute that only covers 3.5hrs of the effective OTP period. And this will linearly grow as the number of TOTPs increases.

- Noir's proving time and TOTP validity period
  Noir's proving currently takes 30-40 seconds on browser, which means that there is always more than 30 sec difference in timestamp between browser proving and on-chain verification.Unless this is shorten, NoirOTP can't set the validity period of an OTP to 30 seconds like common OTPs.

- `block.timestamp` use in on-chain verification while it's forbidden in 4337 validation.
  EIP4337 simply doesn't allow for calling block.timestamp in tx validation phase. Banganoir gets around this by having the check in execution phase: comparing block.timestamp in execution phrase with `lastTimestamp` that was stored in validation phase.

### Scroll

- Lack of 4337 tools
  No 4337 explorer that supports Scroll exist yet.

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
