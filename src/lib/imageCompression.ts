export type CompressedImage = {
	data: Uint8Array;
	width: number;
	height: number;
	mimeType: string;
};

const ONE_MB = 1_048_576;

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))),
			mime,
			quality,
		);
	});
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = url;
	});
}

export async function compressImage(file: File): Promise<CompressedImage> {
	// Pass through non-compressible types unchanged
	if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
		const data = new Uint8Array(await file.arrayBuffer());
		const url = URL.createObjectURL(file);
		try {
			const img = await loadImage(url);
			return { data, width: img.naturalWidth, height: img.naturalHeight, mimeType: file.type };
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	// Already small enough — extract dimensions and return as-is
	if (file.size < ONE_MB) {
		const data = new Uint8Array(await file.arrayBuffer());
		const url = URL.createObjectURL(file);
		try {
			const img = await loadImage(url);
			return { data, width: img.naturalWidth, height: img.naturalHeight, mimeType: file.type };
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	// Load image for drawing
	const objectUrl = URL.createObjectURL(file);
	let img: HTMLImageElement;
	try {
		img = await loadImage(objectUrl);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}

	const naturalWidth = img.naturalWidth;
	const naturalHeight = img.naturalHeight;

	const canvas = document.createElement('canvas');
	canvas.width = naturalWidth;
	canvas.height = naturalHeight;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

	// PNG ignores the quality parameter in toBlob — always switch to JPEG for compression
	let outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
	let bestBlob: Blob | null = null;

	const qualities = [0.85, 0.70, 0.55, 0.40];
	for (const quality of qualities) {
		const blob = await canvasToBlob(canvas, outputMime, quality);

		// PNG toBlob ignores quality — switch to JPEG immediately
		if (outputMime === 'image/png' && blob.size >= ONE_MB) {
			outputMime = 'image/jpeg';
			const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
			if (!bestBlob || jpegBlob.size < bestBlob.size) bestBlob = jpegBlob;
			if (jpegBlob.size < ONE_MB) break;
			continue;
		}

		if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
		if (blob.size < ONE_MB) break;
	}

	// Dimension reduction if quality loop wasn't enough
	if (!bestBlob || bestBlob.size >= ONE_MB) {
		outputMime = 'image/jpeg';
		let currentW = naturalWidth;
		let currentH = naturalHeight;

		while (currentW > 200 && currentH > 200) {
			currentW = Math.round(currentW * 0.75);
			currentH = Math.round(currentH * 0.75);
			canvas.width = currentW;
			canvas.height = currentH;
			ctx.clearRect(0, 0, currentW, currentH);
			ctx.drawImage(img, 0, 0, currentW, currentH);

			const blob = await canvasToBlob(canvas, 'image/jpeg', 0.70);
			if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
			if (blob.size < ONE_MB) break;
		}
	}

	const finalBlob = bestBlob!;
	const data = new Uint8Array(await finalBlob.arrayBuffer());
	return { data, width: canvas.width, height: canvas.height, mimeType: outputMime };
}
