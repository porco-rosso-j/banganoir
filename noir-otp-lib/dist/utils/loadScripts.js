// function loadScript(src: string, integrity: string, crossorigin: string) {
// 	return new Promise((resolve, reject) => {
// 		const script = document.createElement("script");
// 		script.src = src;
// 		script.integrity = integrity;
// 		script.crossOrigin = crossorigin;
// 		script.onload = () => resolve(script);
// 		script.onerror = () => reject(new Error(`Script load error for ${src}`));
// 		document.head.appendChild(script);
// 	});
// }
// export async function loadOtplibDependencies() {
// 	try {
// 		await loadScript(
// 			"https://unpkg.com/@otplib/preset-browser@^12.0.0/buffer.js",
// 			"sha384-integrity-hash",
// 			"anonymous"
// 		);
// 		await loadScript(
// 			"https://unpkg.com/@otplib/preset-browser@^12.0.0/index.js",
// 			"sha384-integrity-hash",
// 			"anonymous"
// 		);
// 		// Now the otplib is available on window.otplib
// 	} catch (error) {
// 		console.error("Failed to load otplib dependencies", error);
// 	}
// }
