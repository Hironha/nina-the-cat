import { SlashCommandBuilder, type ChatInputCommandInteraction, type CacheType } from 'discord.js';

export abstract class Command extends SlashCommandBuilder {
	protected _devOnly: boolean = false;

	constructor() {
		super();
	}

	abstract execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		...args: any[]
	): void | Promise<void>;

	isDevOnly(): boolean {
		return this._devOnly;
	}

	setDevOnly(): this {
		this._devOnly = true;
		return this;
	}
}

export { type CacheType, type ChatInputCommandInteraction };
