import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from './api';
import config from './config.json';
import dotenv from 'dotenv';
import 'babel-core/register';
import 'babel-polyfill';


let app = express();
dotenv.config();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit: config.bodyLimit
}));
app.use(api({ config }));

app.server.listen(process.env.PORT || config.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Started on port ${app.server.address().port}`);
});

export default app;
