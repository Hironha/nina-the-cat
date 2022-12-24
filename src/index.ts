import fs from 'fs';
import { Play } from '@commands/play';

function main() {
	const play = new Play();
	play.execute();
}

main();
