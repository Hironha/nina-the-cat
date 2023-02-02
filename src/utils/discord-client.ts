import { Client, Collection, type ClientOptions } from 'discord.js';

import { Player } from 'discord-player';
import { type Command } from './command/command';

export class DiscordClient<Ready extends boolean = boolean> extends Client<Ready> {
	public player: Player | undefined;
	private _commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this._commands = new Collection();
	}

	get commands(): Collection<string, Command> {
		return this._commands;
	}

	set commands(commands: Collection<string, Command>) {
		this._commands = commands;
	}
}
