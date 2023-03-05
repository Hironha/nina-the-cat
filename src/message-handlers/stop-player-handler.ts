import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';

import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class StopPlayerHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!interaction.isRepliable() || !interaction.guild || !client.player) {
			return super.handle(interaction, client);
		}

		const queue = client.player.getQueue(interaction.guild.id);
		if (!queue || !queue.playing) return super.handle(interaction, client);

		queue.clear();
		queue.stop();
		queue.destroy();

		await super.reply(interaction, { embeds: this.buildEmbedMessage() });
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Stop')
			.setDescription('I stopped playing the song and cleared the queue');

		return [message];
	}
}
