export function intoChunk<T>(arr: T[], size: number): T[][] {
	if (!Number.isInteger(size)) throw new Error('Chunk size should be an integer');

	let chunks: T[][] = [];
	const chunkAmount = Math.ceil(arr.length / size);
	for (let i = 0; i < chunkAmount; i++) {
		chunks.push(arr.slice(i * size, (i + 1) * size));
	}

	return chunks;
}
