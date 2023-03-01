import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class IsPlayingHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && interaction.guild && client.player) {
			const queue = client.player.getQueue(interaction.guild.id);
			if (queue?.playing && queue.current) {
				return super.handle(interaction, client);
			}
		}

		await super.reply(interaction, { embeds: this.buildEmbedMessage() });
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setTitle('😿 | Confused')
			.setDescription("I'm not currently playing any musics!")
			.setColor(Colors.Blue);

		return [message];
	}
}
