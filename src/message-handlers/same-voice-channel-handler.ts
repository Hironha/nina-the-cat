import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { Player } from 'discord-player';

import { isMember } from '@utils/interaction-guards';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class SameVoiceChannelHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable()) {
			if (isMember(interaction.member) && interaction.guild) {
				const player = Player.singleton(client);
				const listenerVoiceChannel = interaction.member.voice.channel;
				const queue = player.queues.get(interaction.guild.id);

				if (listenerVoiceChannel && listenerVoiceChannel.id === queue?.channel?.id) {
					return await super.handle(interaction, client);
				}
			}

			return await super.reply(interaction, { embeds: this.buildEmbedMessage() });
		}

		return super.handle(interaction, client);
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Warning')
			.setDescription("You're not in the same voice channel as me!");

		return [message];
	}
}
