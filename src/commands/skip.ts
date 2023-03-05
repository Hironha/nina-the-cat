import { type ChatInputCommandInteraction } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';

import { Command } from '@utils/command';
import { SkipTrackHandler } from '@message-handlers/skip-track-handler';
import { IsPlayingHandler } from '@message-handlers/is-playing-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { type MessageHandlerOptions } from '@utils/message-handler';

class Skip extends Command {
	constructor() {
		super();
		this.setName('skip')
			.setDescription('Skip a certain amount of songs (defaults to skip current song)')
			.addIntegerOption(option =>
				option.setName('amount').setDescription('Amount of songs to skip').setRequired(false)
			);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };

		await new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new IsPlayingHandler(options))
			.next(new SkipTrackHandler(options))
			.build()
			.handle(interaction, client);
	}
}

export default new Skip();
