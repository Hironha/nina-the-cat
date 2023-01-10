export class Environment {
	static isDevelopment(): boolean {
		return process.env.ENVIRONMENT === 'development';
	}

	static isProduction(): boolean {
		return process.env.ENVIRONMENT !== 'development';
	}

	static getDiscordBotToken(): string | undefined {
		return process.env.DISCORD_BOT_TOKEN;
	}

	static getClientId(): string | undefined {
		return process.env.CLIENT_ID;
	}

	static getGuildId(): string | undefined {
		return process.env.GUILD_ID;
	}

	static getPublishCommands(): boolean {
		const publishCommands = process.env.PUBLISH_COMMANDS;
		if (!publishCommands) return false;
		try {
			return JSON.parse(publishCommands);
		} catch (err) {
			return false;
		}
	}
}
