declare global {
	namespace NodeJS {
		interface ProcessEnv {
      DISCORD_BOT_TOKEN: string | undefined;
			NODE_ENV: 'development' | 'production';
			PORT?: string;
			PWD: string;
		}
	}
}

export {};
