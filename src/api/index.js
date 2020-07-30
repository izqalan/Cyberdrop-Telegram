import { version } from '../../package.json';
import { Router } from 'express';
import root from './root';
import TelegramBot from 'node-telegram-bot-api';
import { extractLink, validURL } from '../lib/util';
import download from 'download';

export default () => {
	let bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true, filepath: false});
	let api = Router();
	// let xray = Xray();
	api.use((req, res, next) => {
    next();
	});
	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.use('/root', root);

	bot.onText(/\/get (.+)/, async (msg, match) => {
		// 'msg' is the received Message from Telegram
		// 'match' is the result of executing the regexp above on the text content
		// of the message
	
		const chatId = msg.chat.id;
		const resp = match[1]; // the captured "whatever"
		// send back the matched "whatever" to the chat

		try {
			let isValid = validURL(resp);
			if (!isValid) {
				throw Error('Invalid url');
			}
			const links = await extractLink(resp);
			bot.sendMessage(chatId, 'Begin downloading, please be patient');			
			for (const i in links) {
				download(links[i].media).then((image) => {
					bot.sendDocument(chatId, image);
				});
			}
		} catch (error) {
			bot.sendMessage(chatId, error.message);
		}
	});

	return api;
};
