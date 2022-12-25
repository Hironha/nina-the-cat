import * as dotenv from 'dotenv';
import { GatewayIntentBits } from 'discord.js';

import { EventUtils } from '@utils/event';
import { PlayerUtils } from '@utils/player';
import { DiscordClient } from '@utils/discord-client';

dotenv.config();

async function main() {
	const token = process.env.DISCORD_BOT_TOKEN as string;

	const client = new DiscordClient({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	const events = await EventUtils.load();
	EventUtils.attach(client, events);

	const player = PlayerUtils.build(client);
	PlayerUtils.attach(client, player);

	client.login(token);
}

main();
