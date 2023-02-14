import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';
import { isMember } from '@utils/interaction-guards';
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
			if (client.player && isMember(interaction.member) && interaction.guild) {
				const listenerVoiceChannel = interaction.member.voice.channel;
				const botVoiceChannel = client.player.voiceUtils.getConnection(
					interaction.guild.id
				).channel;

				if (listenerVoiceChannel && listenerVoiceChannel.id === botVoiceChannel.id) {
					return await super.handle(interaction, client);
				}
			}

			return await super.reply(interaction, { embeds: this.buildEmbedMessage() });
		}
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Warning')
			.setDescription("You're not in the same voice channel as me!");

		return [message];
	}
}
