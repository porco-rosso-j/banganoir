import { ethers } from "ethers";
import AccFacArtifact from "../utils/artifacts/AccountFactory.json";
import {
	BarretenbergBackend,
	CompiledCircuit,
} from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import otpCircuit from "./artifacts/circuits/otp.json";
import { createClient, createPublicClient, http } from "viem";
import { scrollSepolia } from "viem/chains";
import {
	pimlicoBundlerActions,
	pimlicoPaymasterActions,
} from "permissionless/actions/pimlico";
import { getAccountNonce, bundlerActions } from "permissionless";

const providerURL = "https://rpc.ankr.com/scroll_sepolia_testnet";
const provider = new ethers.JsonRpcProvider(providerURL);

const wallet = new ethers.Wallet(
	import.meta.env.VITE_PRIVATE_KEY as string,
	provider
);

const factoryAddr = "0xE3c79375aAE1C7E94D98F2dC6457aCa8fA0C9A47";

const accFacContract = new ethers.Contract(
	factoryAddr,
	AccFacArtifact.abi,
	wallet
);

const dummySig =
	"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

const perhapsPimlicoBundlerScroll =
	"0x4337003fcD2F56DE3977cCb806383E9161628D0E";

const perhapsPimlicoPaymasterScroll =
	"0x4337003fcD2F56DE3977cCb806383E9161628D0E";

const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const pimlicoApiKey = import.meta.env.VITE_PIMLICO_API_KEY;
const pimlicoEndpoint = `https://api.pimlico.io/v2/scroll-sepolia-testnet/rpc?apikey=${pimlicoApiKey}`;
const pimlicoEndpointV1 = `https://api.pimlico.io/v1/scroll-sepolia-testnet/rpc?apikey=${pimlicoApiKey}`;
const pimlicoSponsorPolicyId = "sp_lazy_typhoid_mary";

const scrollSepliaChainId = 534351;
const pimlicoProvider = new ethers.JsonRpcProvider(
	pimlicoEndpointV1,
	scrollSepliaChainId
);

const bundlerClient = createClient({
	chain: scrollSepolia,
	transport: http(pimlicoEndpointV1),
})
	.extend(bundlerActions)
	.extend(pimlicoBundlerActions);

const pimlicoPaymasterClientV1 = createClient({
	chain: scrollSepolia,
	transport: http(pimlicoEndpointV1),
}).extend(pimlicoPaymasterActions);

const pimlicoPaymasterClient = createClient({
	chain: scrollSepolia,
	transport: http(pimlicoEndpoint),
}).extend(pimlicoPaymasterActions);

const publicClient = createPublicClient({
	chain: scrollSepolia,
	transport: http(providerURL),
});

const nonce = async (address: string): Promise<bigint> => {
	console.log("address: ", `0x${address.slice(2)}`);
	return await getAccountNonce(publicClient, {
		sender: `0x${address.slice(2)}`,
		entryPoint: entryPoint,
		key: 0n, // optional
	});
};

const program = otpCircuit as CompiledCircuit;
const backend = new BarretenbergBackend(program, { threads: 8 });
const noir = new Noir(program, backend);

export {
	provider,
	wallet,
	factoryAddr,
	accFacContract,
	noir,
	dummySig,
	scrollSepliaChainId,
	bundlerClient,
	pimlicoPaymasterClient,
	pimlicoPaymasterClientV1,
	entryPoint,
	publicClient,
	pimlicoProvider,
	pimlicoSponsorPolicyId,
	nonce,
};
