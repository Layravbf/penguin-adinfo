'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __asyncValues =
	(this && this.__asyncValues) ||
	function (o) {
		if (!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
		var m = o[Symbol.asyncIterator],
			i;
		return m
			? m.call(o)
			: ((o = typeof __values === 'function' ? __values(o) : o[Symbol.iterator]()),
			  (i = {}),
			  verb('next'),
			  verb('throw'),
			  verb('return'),
			  (i[Symbol.asyncIterator] = function () {
					return this;
			  }),
			  i);
		function verb(n) {
			i[n] =
				o[n] &&
				function (v) {
					return new Promise(function (resolve, reject) {
						(v = o[n](v)), settle(resolve, reject, v.done, v.value);
					});
				};
		}
		function settle(resolve, reject, d, v) {
			Promise.resolve(v).then(function (v) {
				resolve({ value: v, done: d });
			}, reject);
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
const ApiResponse_1 = require('../models/ApiResponse');
const FileDAO_1 = require('../models/DAO/FileDAO');
const CampaignDAO_1 = require('../models/DAO/CampaignDAO');
const AgencyDAO_1 = require('../models/DAO/AgencyDAO');
const Campaign_1 = require('../models/Campaign');
const DateUtils_1 = require('../utils/DateUtils');
const campaign = (app) => {
	app.post('/campaign', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			const apiResponse = new ApiResponse_1.ApiResponse();
			const created = DateUtils_1.DateUtils.today();
			const campaignName = req.body.campaign;
			const company = req.company;
			const agency = req.body.agency ? req.body.agency : 'CompanyCampaigns';
			const campaignId = Date.now().toString(16);
			if (req.permission === 'user') {
				throw new Error('Usuário sem permissão para realizar esta ação!');
			}
			if (!campaignName) {
				throw new Error('Necessário nome da Campanha!');
			}
			const campaignObject = new Campaign_1.Campaign(campaignName, company, agency, campaignId, true, created);
			new CampaignDAO_1.CampaignDAO()
				.addCampaign(campaignObject)
				.then((result) => {
					if (result) {
						apiResponse.statusCode = 200;
						apiResponse.responseText = 'Campanha criada com sucesso!';
					} else {
						throw new Error('Erro ao criar campanha!');
					}
				})
				.catch((err) => {
					apiResponse.statusCode = 500;
					apiResponse.responseText = 'Email e/ou senha incorreto(s)!';
					apiResponse.errorMessage = err.message;
				})
				.finally(() => {
					res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				});
		})
	);
	app.get('/agencies/campaigns', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			var e_1, _a;
			const apiResponse = new ApiResponse_1.ApiResponse();
			const company = req.company;
			const agency = req.agency;
			const permission = req.permission;
			const gettingAgencies = () =>
				__awaiter(void 0, void 0, void 0, function* () {
					return yield new AgencyDAO_1.AgencyDAO().getAllAgenciesFrom(company, agency, permission);
				});
			const agencies = yield gettingAgencies();
			if (permission === 'admin' || permission === ' owner') agencies.push('Campanhas Internas');
<<<<<<< HEAD
=======
			console.log(agencies);
>>>>>>> 39b715d018748d0e9a368f89117ced520b89e2b6
			const agenciasFinal = [];
			try {
				for (
					var agencies_1 = __asyncValues(agencies), agencies_1_1;
					(agencies_1_1 = yield agencies_1.next()), !agencies_1_1.done;

				) {
					const agencia = agencies_1_1.value;
					try {
						const campanhas = yield new CampaignDAO_1.CampaignDAO().getAllCampaignsFrom(agencia, permission);
						if (campanhas) {
							agenciasFinal.push({ [agencia]: campanhas });
						}
					} catch (err) {
						apiResponse.statusCode = 500;
						apiResponse.responseText = 'Erro ao resgatar a campanha!';
						apiResponse.errorMessage = err.message;
						res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
						return;
					}
				}
			} catch (e_1_1) {
				e_1 = { error: e_1_1 };
			} finally {
				try {
					if (agencies_1_1 && !agencies_1_1.done && (_a = agencies_1.return)) yield _a.call(agencies_1);
				} finally {
					if (e_1) throw e_1.error;
				}
			}
			apiResponse.statusCode = 200;
			apiResponse.responseText = JSON.stringify(agenciasFinal);
<<<<<<< HEAD
=======
			console.log(apiResponse.responseText);
>>>>>>> 39b715d018748d0e9a368f89117ced520b89e2b6
			res.status(apiResponse.statusCode).send(apiResponse.responseText);
		})
	);
	app.get('/campaign/:agency/list', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			const apiResponse = new ApiResponse_1.ApiResponse();
			const agency = req.params.agency;
			const permission = req.permission;
			new CampaignDAO_1.CampaignDAO()
				.getAllCampaignsFrom(agency, permission)
				.then((agencies) => {
					apiResponse.responseText = JSON.stringify(agencies);
				})
				.catch((err) => {
					apiResponse.statusCode = 500;
					apiResponse.responseText = err.message;
					apiResponse.errorMessage = err.message;
				})
				.finally(() => {
					res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				});
		})
	);
	app.get('/:agency/:campaignId/csv/list', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			const apiResponse = new ApiResponse_1.ApiResponse();
			const campaignId = req.params.campaignId;
			const agency = req.params.agency;
			const agencyPath = agency === 'Campanhas Internas' ? 'CompanyCampaigns' : agency;
			const company = req.company;
			const permission = req.permission;
			const campaignObject = new CampaignDAO_1.CampaignDAO();
			const campaign = yield campaignObject.getCampaign(campaignId);
			const fileDAO = new FileDAO_1.FileDAO();
			if ((permission === 'agencyOwner' || permission === 'user') && (!agency || agency === 'Campanhas Internas')) {
				apiResponse.responseText = 'Nenhuma agência foi informada!';
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			} else if (!campaign) {
				apiResponse.responseText = 'Nenhuma campanha foi informada!';
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			}
			const filePath = `${company}/${agencyPath}/${campaign}/`;
			fileDAO
				.getAllFilesFromStore(filePath)
				.then((data) => {
					const files = data[0].filter((file) => /\.csv$/.test(file.name)).map((file) => file.name);
					apiResponse.responseText = files.join(',');
					apiResponse.statusCode = 200;
				})
				.catch((err) => {
					apiResponse.errorMessage = err.message;
					apiResponse.responseText = `Falha ao restaurar os arquivos!`;
					apiResponse.statusCode = 500;
				})
				.finally(() => {
					res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				});
		})
	);
	app.post('/campaign/:id/deactivate', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			const apiResponse = new ApiResponse_1.ApiResponse();
			const campaignId = req.params.id;
			const permission = req.permission;
			new CampaignDAO_1.CampaignDAO()
				.deactivateCampaign(campaignId, permission)
				.then((result) => {
					if (result) {
						apiResponse.statusCode = 200;
						apiResponse.responseText = 'Campanha desativada com sucesso!';
					} else {
						throw new Error('Erro ao desativar campanha!');
					}
				})
				.catch((err) => {
					apiResponse.statusCode = 500;
					apiResponse.responseText = 'Email e/ou senha incorreto(s)!';
					apiResponse.errorMessage = err.message;
				})
				.finally(() => {
					res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				});
		})
	);
	app.post('/campaign/:id/reactivate', (req, res) => {
		const apiResponse = new ApiResponse_1.ApiResponse();
		const campaignId = req.params.id;
		const permission = req.permission;
		new CampaignDAO_1.CampaignDAO()
			.reactivateCampaign(campaignId, permission)
			.then((result) => {
				if (result) {
					apiResponse.statusCode = 200;
					apiResponse.responseText = 'Campanha reativada com sucesso!';
				} else {
					throw new Error('Erro ao reativar campanha!');
				}
			})
			.catch((err) => {
				apiResponse.statusCode = 500;
				apiResponse.responseText = 'Email e/ou senha incorreto(s)!';
				apiResponse.errorMessage = err.message;
			})
			.finally(() => {
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
			});
	});
};
exports.default = campaign;
