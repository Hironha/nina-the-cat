import * as dotenv from 'dotenv';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';

import { EventUtils } from '@utils/event';
import { PlayerEventUtils } from '@utils/player-event';
import { DiscordClient } from '@utils/discord-client';

dotenv.config();

async function main() {
	const token = process.env.DISCORD_BOT_TOKEN as string;

	const client = new DiscordClient({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	const events = await EventUtils.load();
	EventUtils.attach(client, events);

	const player = new Player(client);
	const playerEvents = await PlayerEventUtils.load();
	PlayerEventUtils.attach(player, playerEvents);

	client.login(token);
}

main();
