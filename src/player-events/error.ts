import { type PlayerEvent } from '@utils/player-event';
import { type PlayerEvents, type Queue } from 'discord-player';

class PlayerError implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'error';

	async execute(queue: Queue<any>, error: Error): Promise<void> {
		console.error(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
	}
}

export default new PlayerError();
