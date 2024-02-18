## NoirOTP

still not published. WIP...

```shell
yarn add "@porco/noir-otp-lib @otplib/preset-browser "@noir-lang/backend_barretenberg @noir-lang/noir_js
```

instantiate

```shell
import { BarretenbergBackend, CompiledCircuit } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import otpCircuit from "./artifacts/circuits/otp.json";
import { authenticator } from "@otplib/preset-browser";

const program = otpCircuit as CompiledCircuit;
const backend = new BarretenbergBackend(program, { threads: 8 });
const noir = new Noir(program, backend);

const auth = authenticator;

const noirOTP = new NoirOTP(noir, authenticator);

async function init() {
   const root = await noirOTP.initialize();
}

```
