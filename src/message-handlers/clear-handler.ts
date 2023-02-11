import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class ClearHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && client.player && interaction.guild) {
			const guild = interaction.guild;
			const queue = client.player.getQueue(guild.id);
			if (queue) {
				queue.clear();
				return await this.reply(interaction, { embeds: this.buildEmbedMessage() });
			}
		}

		return super.handle(interaction, client);
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Clear')
			.setDescription('Queue is now empty');

		return [message];
	}
}
