import { type MessageHandlerOptions } from '@utils/message-handler';
import { EmptyQueueHandler } from '@message-handlers/empty-queue-handler';
import { ShuffleQueueHandler } from '@message-handlers/shuffle-queue-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';

import { type DiscordClient } from '@utils/discord-client';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

export class Shuffle extends Command {
	constructor() {
		super();
		this.setName('shuffle').setDescription('Shuffle all songs in queue');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };
		await new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new EmptyQueueHandler(options))
			.next(new ShuffleQueueHandler(options))
			.build()
			.handle(interaction, client);
	}
}
