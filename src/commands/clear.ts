import { type DiscordClient } from '@utils/discord-client';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { ClearHandler } from '@message-handlers/clear-handler';
import { EmptyQueueHandler } from '@message-handlers/empty-queue-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';

class Clear extends Command {
	constructor() {
		super();
		this.setName('clear').setDescription('Clear all songs in queue');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const commonOptions = { method: 'edit-reply' } as const;

		await new MessageHandlersChain(new InVoiceChannelHandler(commonOptions))
			.next(new SameVoiceChannelHandler(commonOptions))
			.next(new EmptyQueueHandler(commonOptions))
			.next(new ClearHandler(commonOptions))
			.build()
			.handle(interaction, client);
	}
}

export default new Clear();
