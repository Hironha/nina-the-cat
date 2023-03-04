import { IsPlayingHandler } from '@message-handlers/is-playing-handler';
import { StopPlayerHandler } from '@message-handlers/stop-player-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';

import { type DiscordClient } from '@utils/discord-client';
import { type MessageHandlerOptions } from '@utils/message-handler';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Stop extends Command {
	constructor() {
		super();
		this.setName('stop').setDescription("Stop playing the song and clears the song's queue");
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };

		new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new IsPlayingHandler(options))
			.next(new StopPlayerHandler(options))
			.build()
			.handle(interaction, client);
	}
}

export default new Stop();
