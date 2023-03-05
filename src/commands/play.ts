import { PlayTrackHandler } from '@message-handlers/play-track-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { type MessageHandlerOptions } from '@utils/message-handler';

import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

class Play extends Command {
	constructor() {
		super();
		this.setName('play')
			.setDescription('Play a song in your voice channel')
			.addStringOption(option =>
				option.setName('query').setDescription('The song you want to play').setRequired(true)
			);
	}

	async execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };

		await new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new PlayTrackHandler(options))
			.build()
			.handle(interaction, client);
	}
}

export default new Play();
