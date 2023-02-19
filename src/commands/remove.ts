import { type MessageHandlerOptions } from '@utils/message-handler';
import { MessageHandlersChain } from '@utils/message-handler/message-handlers-chain';
import { RemoveTrackHandler } from '@message-handlers/remove-track-handler';
import { InVoiceChannelHandler } from '@message-handlers/in-voice-channel-handler';
import { EmptyQueueHandler } from '@message-handlers/empty-queue-handler';
import { SameVoiceChannelHandler } from '@message-handlers/same-voice-channel-handler';
import { type DiscordClient } from '@utils/discord-client';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Remove extends Command {
	constructor() {
		super();
		this.setName('remove')
			.setDescription('Removes the selected song from queue')
			.addIntegerOption(option =>
				option
					.setName('song')
					.setDescription('Inform the index of the selected song in queue')
					.setRequired(true)
			);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		const options: MessageHandlerOptions<{}> = { method: 'edit-reply' };

		await new MessageHandlersChain(new InVoiceChannelHandler(options))
			.next(new SameVoiceChannelHandler(options))
			.next(new EmptyQueueHandler(options))
			.next(new RemoveTrackHandler(options))
			.build()
			.handle(interaction, client);
	}
}

export default new Remove();
