import { Colors, EmbedBuilder, type ChatInputCommandInteraction, type CacheType } from 'discord.js';

import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class ShuffleQueueHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!interaction.isRepliable() || !client.player || !interaction.guild) {
			return super.handle(interaction, client);
		}

		const queue = client.player.getQueue(interaction.guild.id);
		if (!queue) return super.handle(interaction, client);

		if (!queue.shuffle()) {
			const failMessage = "I couldn't shuffle the queue, sorry";
			return super.reply(interaction, { content: failMessage });
		}

		return super.reply(interaction, { embeds: this.buildEmbedMessage() });
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Shuffle')
			.setDescription('I shuffled all songs in queue, be grateful');

		return [message];
	}
}
