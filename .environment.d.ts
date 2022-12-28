declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PUBLISH_COMMANDS?: 'true' | 'false'
			DISCORD_BOT_TOKEN: string | undefined;
			CLIENT_ID: string | undefined;
			GUILD_ID: string | undefined;
			NODE_ENV: 'development' | 'production';
			PORT?: string;
			PWD: string;
		}
	}
}

export {};
