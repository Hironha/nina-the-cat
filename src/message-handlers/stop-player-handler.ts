import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';

import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';
import { Player } from 'discord-player';

type Options = {};

export class StopPlayerHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!interaction.isRepliable() || !interaction.guild) {
			return super.handle(interaction, client);
		}

		const player = Player.singleton(client);
		const queue = player.nodes.get(interaction.guild.id);
		if (!queue || !queue.node.isPlaying()) return super.handle(interaction, client);

		queue.clear();
		queue.node.stop();
		queue.delete();

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
