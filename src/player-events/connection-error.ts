import { type PlayerEvents, type Queue } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

class ConnectionError implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'connectionError';

	async execute(queue: Queue<any>, error: Error): Promise<void> {
		console.error(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
	}
}

export default new ConnectionError();
