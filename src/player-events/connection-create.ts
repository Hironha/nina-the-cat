import { type TextBasedChannel } from 'discord.js';
import { VoiceConnectionStatus } from '@discordjs/voice';
import { type PlayerEvents, type Queue } from 'discord-player';

import { type PlayerEvent } from '@utils/player-event';

class ConnectionCreate implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'connectionCreate';

	async execute(queue: Queue<TextBasedChannel>): Promise<void> {
		if (!queue.metadata) return;

		queue.connection.voiceConnection.on('stateChange', (oldState, newState) => {
			if (
				oldState.status === VoiceConnectionStatus.Ready &&
				newState.status === VoiceConnectionStatus.Connecting
			) {
				queue.connection.voiceConnection.configureNetworking();
			}
		});
	}
}

export default new ConnectionCreate();
