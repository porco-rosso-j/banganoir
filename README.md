## NoirOTP

NoirOTP is a zk-powered TOTP(Time-based one-time password) solution compatible with any authenticator app, e.g. Google Authenticator. It leverages Noir, a DSL for writing zero-knowledge proof circuits.

### Under the hood

Unlike popular OTP schemes where a user and website have to securely store a shared secret that is used to generate a corresponding OTP at a given authentication time, in NoirOTP, only the user needs to keep the secret inside their Authenticator app, more specifically, secure storage in their local device. It's discarded immediately after the initial setup in which the secret key is randomly generated to create TOTP hashes and a merkle tree, and the user registers it on their Authenticator app by scanning a QR code shown on a website.

The TOTP hashes and the merkle tree mentioned above play a crucial role in authentication. The TOTP hashes are created out of pre-generated TOTPs using the secret and timestamps during the initial setup. The hashes are nodes of the Merkle Tree, and its merkle root is stored on-chain and can be used for authentications happening in the future.

Whenever an authentication is needed, the user opens their Authenticator App to get a 6-digit password and provide it with the website. With the given otp and the timestamp at that time, a Merkle-inclusion proof of the TOTP hash (`pedersenHash(otp, time)`), is generated off-chain with `noir_js`, and the proof verification is carried out on-chain.

It's worth noting that all the generated TOTP hashes must be stored somewhere as they are needed to obtain parameters of the proof generation, such as `hash_path` and `index` (of the given leaf node). To address this, TOTP hashes are stored on IPFS network through Pinata's Javascript API at the intial setup, and they are retrived to generate a Merkle-inclusion proof off-chain at every authentication. For the current setup that creates 64 TOTP hashes that can cover about 3.5 hrs of authentication, it is reasonable to store it on cheaper and immutable off-chain storage instead of neither smart contract nor browser storage.

This way, it not only replicates the role of websites do in the current TOTP scheme on-chain without storing secret on smart contract but also eliminates trusted intermediately, which is a remote server hosted by counterparty websites. But except for a few drawbacks described below, there is not big differences in UX between the conventional TOTP and NoirOTP solutions from the user point of view.

### Banganoir

Banganoir is an ERC4337 Wallet controlled by your Aadhaar identity, which integrates NoirOTP to provide an additional layer of security for your funds. WIP...

// scroll
// pimlico

### Challenges

- proving time vs timestep
- verification cost
- the use of timestamp in on-chain verification while it's forbidden in 4337 tx.
- difficulties of 4337 on scroll

### Deploy

```shell
forge script script/Deploy.s.sol:Deploy --rpc-url scroll-sepolia --broadcast --legacy
```
