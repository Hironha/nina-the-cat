import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class EmptyQueueHandler extends MessageHandler {
	constructor(options: MessageHandlerOptions<Options>) {
		super(options.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && client.player && interaction.guild) {
			const queue = client.player.getQueue(interaction.guild.id);
			const isQueueEmpty = queue?.tracks.length === 0 && !queue?.playing;
			if (!queue || isQueueEmpty) {
				await this.reply(interaction, { embeds: this.buildMessage() });
			}
		}

		await super.handle(interaction, client);
	}

	private buildMessage(): EmbedBuilder[] {
		const clearMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😿 | Empty')
			.setDescription('There are no queued songs!');

		return [clearMessage];
	}
}
