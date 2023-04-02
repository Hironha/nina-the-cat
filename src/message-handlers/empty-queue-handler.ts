import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { Player } from 'discord-player';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class EmptyQueueHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && interaction.guild) {
			const player = Player.singleton(client);
			const queue = player.nodes.get(interaction.guild.id);
			const isQueueEmpty = !queue?.tracks.size && !queue?.node.isPlaying();

			if (!queue || isQueueEmpty) {
				return await this.reply(interaction, { embeds: this.buildEmbedMessage() });
			}
		}

		await super.handle(interaction, client);
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const clearMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😿 | Empty')
			.setDescription('There are no queued songs!');

		return [clearMessage];
	}
}
