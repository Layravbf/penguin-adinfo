import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as fileUpload from 'express-fileupload';
import routes from './routes/routes';
import { config } from 'dotenv';
import { Auth } from './models/Auth';
import { AuthDAO } from './models/DAO/AuthDAO';

config({ path: __dirname + '/.env' });

const app = express();

app.use(
	fileUpload({
		createParentPath: true,
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
	cors({
		allowedHeaders: [
			'token',
			'agency',
			'Content-Type',
			'company',
			'file',
			'data',
			'config',
		],
		exposedHeaders: [
			'token',
			'agency',
			'company',
			'file',
			'data',
			'config',
		],
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
	})
);

app.all(
	'*',
	async (
		req: { [key: string]: any },
		res: { [key: string]: any },
		next: any
	) => {
		const token = req.headers.token;
		if (token) {
			const authDAO = new AuthDAO(token);
			authDAO
				.getAuth()
				.then((auth: Auth) => {
					req.company = auth.company;
					req.agency = auth.agency;
					if (auth.hasPermissionFor(req.url, req.method)) {
						next();
					} else {
						res.status(403).send(
							'Usuário sem permissão para realizar a ação!'
						);
					}
				})
				.catch((err) => {
					res.status(403).send('Usuário Inválido');
				});
		}
	}
);

routes(app);

app.get('/', (req: { [key: string]: any }, res: { [key: string]: any }) =>
	res.status(200).send('OK')
);

module.exports = app;