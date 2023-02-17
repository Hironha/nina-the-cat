import { type DiscordClient } from '@utils/discord-client';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { NowPlayingHandler } from '@message-handlers/now-playing-handler';
import { IsPlayingHandler } from '@message-handlers/is-playing-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';

import { Command, type ChatInputCommandInteraction } from '@utils/command';

class NowPlaying extends Command {
	constructor() {
		super();
		this.setName('nowplaying').setDescription('Show information about the playing song');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options = { method: 'edit-reply' } as const;

		new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new IsPlayingHandler(options))
			.next(new NowPlayingHandler(options))
			.build()
			.handle(interaction, client);
	}
}

export default new NowPlaying();
