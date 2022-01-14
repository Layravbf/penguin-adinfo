'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_validator_1 = require('express-validator');
const User_1 = require('../models/User');
const UserDAO_1 = require('../models/DAO/UserDAO');
const ApiResponse_1 = require('../models/ApiResponse');
const register = (app) => {
	app.post(
		'/register',
		express_validator_1.body('permission').exists().withMessage('Parâmetro permission é obrigatório.'),
		express_validator_1
			.body('email')
			.exists()
			.withMessage('Parâmetro email é obrigatório.')
			.isEmail()
			.withMessage('Email inválido.'),
		express_validator_1.body('password').exists().withMessage('Parâmetro password é obrigatório.'),
		(req, res) => {
			const validationErrors = express_validator_1.validationResult(req).array();
			const apiResponse = new ApiResponse_1.ApiResponse();
			let adOpsTeam = '';
			if (req.adOpsTeam && req.body.permission === 'user') {
				adOpsTeam = req.adOpsTeam;
			} else if (req.body.adOpsTeam && req.body.permission === 'adOpsTeamLeader') {
				adOpsTeam = req.body.adOpsTeam;
			} else if (
				!req.adOpsTeam &&
				!req.body.adOpsTeam &&
				(req.body.permission === 'user' || req.body.permission === 'adOpsTeamLeader')
			) {
				validationErrors.push({
					param: 'email',
					value: req.body.adOpsTeam,
					location: 'body',
					msg: 'Não foi possível encontrar a agência.',
				});
			}
			if (validationErrors.length > 0) {
				const message = validationErrors.map((err) => err.msg).join(' ');
				apiResponse.responseText = message;
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			}
			const newUser = new User_1.User(
				'',
				req.body.permission,
				req.advertiser,
				req.body.email,
				true,
				adOpsTeam,
				req.body.password
			);
			const userDAO = new UserDAO_1.UserDAO();
			userDAO
				.addUser(newUser)
				.then(() => {
					const message = `Usuário criado para o email ${newUser.email}`;
					apiResponse.responseText = message;
					apiResponse.statusCode = 200;
				})
				.catch((err) => {
					const message = 'Falha ao criar permissão!';
					apiResponse.responseText = message;
					apiResponse.errorMessage = err.message;
					apiResponse.statusCode = 500;
				})
				.finally(() => {
					res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				});
		}
	);
};
exports.default = register;
