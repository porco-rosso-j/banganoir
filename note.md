## Noir TOTP

- a user creates merkle root out of top and tiemstamp(time step) locally.
- for testing, we use 20160 time step as part of each leaf for a 15 depth of merkle tree to cover a week of otp verifications
- storing <20k of hash strings with 66 characters take about 2.5 MB. Browser storage's limit is 5-10MB.
- storing hash to ipfs would be ideal and the most practical solution in the future.

### Thoughts

- shared-secret can be generated at otp-generation/merkle tree construction time and each time to receive otps.
  sign(msg) => secret... hash(secret, timestmap) => each totp.

-

- Problem: timestamp at OTP geenration / proving time will be differet form the one at verification in smart contract.

- solutions..

1.  ignore timestamp in smart contract
    => locally users can pick any time step they want: hashed value will be valid anyway as its part of the merkle root
    =>

        can this scheme ignore timestamp, meaning that

## References

- https://dev.to/vimiomori/implementing-your-own-time-based-otp-generator-1n35
- https://pyauth.github.io/pyotp/
- https://www.npmjs.com/package/totp-generator
- https://github.com/yeojz/otplib
-
