import { GuildMember } from 'discord.js';

export function isMember(member: unknown): member is GuildMember {
	if (!member) return false;
	return member instanceof GuildMember;
}
