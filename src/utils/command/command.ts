import { SlashCommandBuilder, type ChatInputCommandInteraction, type CacheType } from 'discord.js';

export abstract class Command extends SlashCommandBuilder {
	constructor() {
		super();
	}

	abstract execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		...args: any[]
	): any;

	abstract build(): this;
}

export { type CacheType, type ChatInputCommandInteraction };