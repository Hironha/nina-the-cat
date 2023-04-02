import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { Player } from 'discord-player';
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
		if (interaction.isRepliable() && interaction.guild) {
			const player = Player.singleton(client);
			const guild = interaction.guild;
			const queue = player.nodes.get(guild.id);

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
