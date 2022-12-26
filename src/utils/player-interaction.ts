import {
	GuildMember,
	type Guild,
	type TextBasedChannel,
	type VoiceBasedChannel,
	type InteractionReplyOptions,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { left, right, type Either } from './flow';

export class PlayerInteractionUtils {
	private constructor() {}

	static getMember(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, GuildMember> {
		if (interaction.member instanceof GuildMember) {
			return right(interaction.member);
		}

		return left({ content: `You're not a guild member!`, ephemeral: true });
	}

	static getGuild(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, Guild> {
		if (interaction.guild) {
			return right(interaction.guild);
		}

		return left({ content: 'You should be in a guild to use my services!', ephemeral: true });
	}

	static getVoiceChannel(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, VoiceBasedChannel> {
		const member = this.getMember(interaction);
		if (member.isLeft()) return member;

		const { channel } = member.value.voice;
		if (channel) return right(channel);

		return left({ content: 'You are not in a voice channel!', ephemeral: true });
	}

	static getTextChannel(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, TextBasedChannel> {
		if (interaction.channel) return right(interaction.channel);

		return left({ content: 'Text channel not defined!', ephemeral: true });
	}
}