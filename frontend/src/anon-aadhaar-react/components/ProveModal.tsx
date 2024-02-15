import React, {
	useEffect,
	useState,
	Dispatch,
	SetStateAction,
	useContext,
} from "react";
import styled from "styled-components";
import { FileInput } from "./FileInput";
import { uploadQRpng } from "../util";
import { AadhaarQRValidation } from "../interface";
import { ErrorToast } from "./ErrorToast";
import { BrowserView } from "react-device-detect";
import { Logo } from "./LogInWithAnonAadhaar";
import { verifySignature } from "../verifySignature";
import { AnonAadhaarContext } from "../hooks/useAnonAadhaar";
import { ScanQR } from "./ScanQR";
import { ProveButton } from "./ProveButton";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	errorMessage: string | null;
	setErrorMessage: Dispatch<SetStateAction<string | null>>;
	logo: string;
	qrStatus: AadhaarQRValidation | null;
	setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>;
	signal?: string;
}

export const ProveModal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	errorMessage,
	setErrorMessage,
	logo,
	qrStatus,
	setQrStatus,
}) => {
	const { useTestAadhaar } = useContext(AnonAadhaarContext);
	const [qrData, setQrData] = useState<string | null>(null);
	const [provingEnabled, setProvingEnabled] = useState<boolean>(false);
	const [isScanQR, setIsScanQR] = useState<boolean>(false);

	console.log("qrStatus: ", qrStatus);
	console.log("qrData: ", qrData);

	useEffect(() => {
		if (qrData) {
			verifySignature(qrData, useTestAadhaar)
				.then((verified) => {
					verified
						? setQrStatus(AadhaarQRValidation.SIGNATURE_VERIFIED)
						: setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
				})
				.catch((error) => {
					setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
					console.error(error);
				});
		}
	}, [qrData]);

	useEffect(() => {
		if (qrStatus === AadhaarQRValidation.SIGNATURE_VERIFIED) {
			setProvingEnabled(true);
		} else {
			setProvingEnabled(false);
		}
	}, [qrStatus]);

	// useEffect(() => {
	// 	if (qrData && qrStatus == AadhaarQRValidation.SIGNATURE_VERIFIED) {
	// 		// const witness = await calcuWitness(qrData)
	// 		// setUserNullifier(witness[2])
	// 		getUserNullifier(qrData);
	// 	}
	// });
	// useEffect(() => {
	// 	if (qrStatus === AadhaarQRValidation.SIGNATURE_VERIFIED) {
	// 		startProving();
	// 	}
	// }, [qrStatus]);

	// const startProving = async () => {
	// 	try {
	// 		if (qrData === null) throw new Error("Missing application Id!");

	// 		const args = await processAadhaarArgs(qrData, useTestAadhaar);

	// 		startReq({ type: "login", args });
	// 	} catch (error) {
	// 		console.log(error);
	// 		if (error instanceof Error) setErrorMessage(error.message);
	// 	}
	// };

	// async function getUserNullifier(qrData: string) {
	// 	await calcuWitness(qrData);
	// }

	return isOpen ? (
		<ModalOverlay onClick={onClose}>
			<BrowserView>
				<ModalContent onClick={(e) => e.stopPropagation()}>
					{errorMessage !== null && (
						<ErrorToast
							message={errorMessage}
							setErrorMessage={setErrorMessage}
						/>
					)}
					<TitleSection>
						<Title>
							<Logo src={logo} />
							Provide Aadhaar Identity
						</Title>
						<Disclaimer>
							Anon Aadhaar allows you to create a proof of your Aadhaar ID
							without revealing any personal data. Generate a QR code using the
							mAadhaar app (
							<a
								className="text-blue-500 underline cursor-pointer"
								href="https://apps.apple.com/in/app/maadhaar/id1435469474"
								target="_blank"
								rel="noreferrer"
							>
								iOS
							</a>{" "}
							/{" "}
							<a
								className="text-blue-500 underline cursor-pointer"
								href="https://play.google.com/store/apps/details?id=in.gov.uidai.mAadhaarPlus&hl=en_IN&pli=1"
								target="_blank"
								rel="noreferrer"
							>
								Android
							</a>
							), by entering your Aadhaar number and OTP verification. You can
							then save the QR as an image using the &apos;Share&apos; button
							for import.
							<p>
								This process is local to your browser for privacy, and QR images
								are not uploaded to any server.
							</p>
							{/* <p>&nbsp;</p> */}
							<p>Note: Internet speed may affect processing time.</p>
						</Disclaimer>
					</TitleSection>

					<UploadSection>
						<UploadFile>
							{!isScanQR ? (
								<>
									<Label>Upload your Aadhaar secure QR Code </Label>
									<FileInput
										onChange={async (e) => {
											const { qrValue } = await uploadQRpng(e, setQrStatus);
											setQrData(qrValue);
										}}
										id={"handlePdfChange"}
									/>
								</>
							) : (
								<>
									<Label>Scan your Aadhaar secure QR Code: </Label>
									<ScanQR setQrData={setQrData} setQrStatus={setQrStatus} />
								</>
							)}
							{!qrData ? (
								<SwitchQRUpload onClick={() => setIsScanQR(!isScanQR)}>
									Or {isScanQR ? "upload" : "scan"} QR instead?
								</SwitchQRUpload>
							) : null}
							<DocumentResult>{qrStatus}</DocumentResult>
						</UploadFile>
					</UploadSection>
					<ProveButton
						qrData={qrData}
						provingEnabled={provingEnabled}
						setErrorMessage={setErrorMessage}
					/>
				</ModalContent>
			</BrowserView>
		</ModalOverlay>
	) : null;
};

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
`;

const ModalContent = styled.div`
	position: fixed;
	display: flex;
	flex-direction: column;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #ffffff;
	border-radius: 1rem;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	justify-content: space-between;

	@media (max-width: 425px) {
		/* For screens <= 425px (e.g., mobile devices) */
		width: 100%;
		height: 30%;
		max-width: 100%;
		max-height: 100%;
	}

	@media (min-width: 426px) {
		/* For screens > 426px (e.g., desktop) */
		min-height: 400px;
		max-width: 400px;
		width: 80%;
	}
`;

const UploadFile = styled.div`
	margin-top: 20px;
	margin-bottom: 25px;
`;

const SwitchQRUpload = styled.div`
	color: #ffbf00;
	margin-top: 5px;
	margin-right: 5px;
	text-align: right;
	font-size: 12px;
	text-decoration: underline;
	cursor: pointer;
`;

const DocumentResult = styled.div`
	color: #111827;
	position: absolute;
	text-align: right;
	font-size: 0.875rem;
	margin-top: 10px;
	margin-bottom: 20px; // here
`;

const TitleSection = styled.div`
	color: #111827;
	flex-shrink: 0;
	row-gap: 1rem;
	margin-left: auto;
	margin-right: auto;
	margin: 1rem 1rem 0;
	display: flex;
	flex-flow: column;
`;

const Title = styled.h3`
	display: flex;
	flex-shrink: 0;
	margin-left: auto;
	margin-right: auto;
	font-size: medium;
	font-weight: bold;
`;

const Disclaimer = styled.span`
	color: #6d6d6d;
	margin-top: 0.1rem;
	font-size: small;
	font-weight: normal;
`;

const UploadSection = styled.div`
	margin: 0 1rem 0;
	row-gap: 1rem;
	max-width: 100%;
`;

const Label = styled.div`
	font-size: medium;
	text-align: left;
	font-weight: 500;
	color: #111827;
`;
