import { version } from '../../package.json';
import { Router } from 'express';
import root from './root';
import TelegramBot from 'node-telegram-bot-api';
import { extractLink, validURL, downloadAlbum } from '../lib/util';
import download from 'download';

export default ({ config, db }) => {
	let bot = new TelegramBot('1363748593:AAHEXIOZYl8mZVRWuWD9F6RcDRpP054Do_s', {polling: true});
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
			// const media = await downloadAlbum(links);
			// downloadAlbum(links).then((media) => {
			// 	console.log(media);
			// 	bot.sendMediaGroup(chatId, media)
			// });
			// bot.sendMediaGroup(chatId, media);
			bot.sendMessage(chatId, 'downloading');
			for (const i in links) {
				download(links[i].image).then((image) => {
					bot.sendPhoto(chatId, image);
				});
			}
		} catch (error) {
			console.error(error);
			bot.sendMessage(chatId, error.message);
		}
	});

	return api;
};
