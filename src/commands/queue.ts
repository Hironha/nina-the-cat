import { type DiscordClient } from '@utils/discord-client';
import { type MessageHandlerOptions } from '@utils/message-handler';
import { Command, type ChatInputCommandInteraction } from '@utils/command';
import { ListQueueHandler } from '@message-handlers/list-queue-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';

export class Queue extends Command {
	constructor() {
		super();
		this.setName('queue').setDescription('View the queue of current songs');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };

		await new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new ListQueueHandler(options))
			.build()
			.handle(interaction, client);
	}
}
