import {
	type Guild,
	type GuildMember,
	type InteractionReplyOptions,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { type Track, type Player } from 'discord-player';
import { type DiscordClient } from '@utils/discord-client';

import { Command } from '@utils/command';
import { left, right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';

type InteractionProperties = {
	member: GuildMember;
	guild: Guild;
};

class Skip extends Command {
	constructor() {
		super();
		this.setName('skip').setDescription('Skip current song!');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		const interactionProperties = this.getInteractionProperties(interaction);
		if (interactionProperties.isLeft()) {
			return void interaction.reply(interactionProperties.value);
		}

		const { player } = client;
		const { guild, member } = interactionProperties.value;

		const canMemberCall = this.validateCall(member, guild);
		if (canMemberCall.isLeft()) {
			return void interaction.reply(canMemberCall.value);
		}

		await interaction.deferReply();

		const skippedTrack = this.skipTrack(player, guild.id);
		if (skippedTrack.isLeft()) {
			return void interaction.reply(skippedTrack.value);
		}

		interaction.followUp({
			content: `✅ | Skipped **${skippedTrack.value}**!`,
		});
	}

	private skipTrack(player: Player, queueId: string): Either<InteractionReplyOptions, Track> {
		const queue = player.getQueue(queueId);
		if (!queue || !queue.playing) {
			return left({ content: '❌ | No music is being played!' });
		}

		const currentTrack = queue.current;
		const success = queue.skip();
		if (!success) {
			return left({ content: '❌ | Something went wrong!' });
		}

		return right(currentTrack);
	}

	private validateCall(member: GuildMember, guild: Guild): Either<InteractionReplyOptions, null> {
		if (member.guild.id === guild.id) return right(null);

		return left({ content: "You're not a guild member!", ephemeral: true });
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const member = PlayerInteractionUtils.getMember(interaction);
		if (member.isLeft()) return member;

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return guild;

		return right({ member: member.value, guild: guild.value });
	}
}

export default new Skip();
