import {
	Colors,
	GuildMember,
	EmbedBuilder,
	type CacheType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { isMember } from '@utils/interaction-guards';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class InVoiceChannelHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && isMember(interaction.member)) {
			if (!interaction.member.voice.channel) {
				return await this.reply(interaction, { embeds: this.buildEmbedMessage(), ephemeral: true });
			}
		}

		await super.handle(interaction, client);
	}

	private buildEmbedMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Confused')
			.setDescription("You're not in a voice channel?!");

		return [message];
	}
}
