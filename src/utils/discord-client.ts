import { Client, Collection, type ClientOptions } from 'discord.js';

import { type Command } from './command/command';

export class DiscordClient<Ready extends boolean = boolean> extends Client<Ready> {
	private _commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this._commands = new Collection();
	}

	get commands() {
		return this._commands;
	}

	set commands(commands: Collection<string, Command>) {
		this._commands = commands;
	}
}
