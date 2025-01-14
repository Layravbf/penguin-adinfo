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
Object.defineProperty(exports, '__esModule', { value: true });
const ConfigDAO_1 = require('../models/DAO/ConfigDAO');
const FileDAO_1 = require('../models/DAO/FileDAO');
const DateUtils_1 = require('../utils/DateUtils');
const CsvUtils_1 = require('../utils/CsvUtils');
const Builder_1 = require('../controllers/Builder');
const ApiResponse_1 = require('../models/ApiResponse');
const CampaignDAO_1 = require('../models/DAO/CampaignDAO');
const converter = require('json-2-csv');
const build = (app) => {
	app.post('/build/:analyticsTool/:media?', (req, res) =>
		__awaiter(void 0, void 0, void 0, function* () {
			const analyticsTool = req.params.analyticsTool;
			const media = req.params.media;
			const company = req.company;
			const agency = req.headers.agency;
			const agencyPath = agency ? agency : 'CompanyCampaigns';
			const campaign = req.headers.campaign;
			const permission = req.permission;
			const agencyCampaigns = yield new CampaignDAO_1.CampaignDAO().getAllCampaignsFrom(agencyPath, permission);
			const agencyCampaignsNames = agencyCampaigns.map((campaign) => {
				return campaign.campaignName;
			});
			const pathDefault = `${company}/${agencyPath}/${campaign}`;
			const fullHistoricalFilePath = `${pathDefault}/historical`;
			const correctHistoricalFilePath = `${pathDefault}/correctHistorical`;
			const apiResponse = new ApiResponse_1.ApiResponse();
			if (!agencyCampaignsNames.includes(campaign)) {
				apiResponse.responseText = 'Campanha não cadastrada na agência!';
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			} else if (!req.files || !req.files.data) {
				apiResponse.responseText = 'Nenhum arquivo foi enviado!';
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			} else if (!campaign) {
				apiResponse.responseText = 'Nenhuma campanha foi informada!';
				apiResponse.statusCode = 400;
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
				return;
			}
			const fileName = DateUtils_1.DateUtils.generateDateString();
			const fileContent = req.files.data.data;
			const filePath = `${company}/${agencyPath}/${campaign}/${DateUtils_1.DateUtils.generateDateString()}.csv`;
			let companyConfig;
			const configDAO = new ConfigDAO_1.ConfigDAO(company);
			configDAO
				.getLastConfig()
				.then((config) => {
					companyConfig = config;
					if (companyConfig) {
						const companyConfigJson = companyConfig.toJson();
						if (!companyConfigJson[analyticsTool]) {
							apiResponse.statusCode = 400;
							throw new Error(`Ferramenta de Analytics ${media} não foi configurada!`);
						} else if (media && !companyConfigJson[media]) {
							apiResponse.statusCode = 400;
							throw new Error(`Mídia ${media} não foi configurada!`);
						}
						const fileDAO = new FileDAO_1.FileDAO();
						fileDAO.file = fileContent;
						return fileDAO.save(filePath);
					} else {
						apiResponse.statusCode = 500;
						throw new Error('Nenhuma configuração encontrada!');
					}
				})
				.then(() =>
					__awaiter(void 0, void 0, void 0, function* () {
						const csvContent = fileContent.toString();
						const separator = CsvUtils_1.CsvUtils.identifyCsvSepartor(
							csvContent.split('\n')[0],
							companyConfig.csvSeparator
						);
						const jsonFromFile = CsvUtils_1.CsvUtils.csv2json(csvContent, separator);
						const jsonParameterized = new Builder_1.Builder(jsonFromFile, companyConfig, analyticsTool, media).build();
						const configVersion = companyConfig.version;
						const configTimestamp = DateUtils_1.DateUtils.newDateStringFormat(
							companyConfig.insertTime,
							'yyyymmddhhMMss',
							'hh:MM:ss dd/mm/yyyy'
						);
						let [fullHistoricalContent, correctHistoricalContent] = yield Promise.all([
							(yield new FileDAO_1.FileDAO().getContentFrom(
								`${fullHistoricalFilePath}_${companyConfig.version}.csv`
							)).toString(),
							(yield new FileDAO_1.FileDAO().getContentFrom(
								`${correctHistoricalFilePath}_${companyConfig.version}.csv`
							)).toString(),
						]);
						return new Promise((resolve, reject) => {
							converter.json2csv(
								jsonParameterized,
								(err, csv) =>
									__awaiter(void 0, void 0, void 0, function* () {
										const csvHeader = csv.split('\n')[0].split(separator).slice(0, -1).join(separator);
										const csvArrayContent = csv.split('\n').slice(1);
										const linesCorrectToSaveIntoCsv = csvArrayContent
											.filter((csvLine) => {
												const csvLineArray = csvLine.split(separator);
												return csvLineArray[csvLineArray.length - 1] === 'false';
											})
											.map((csvLine) => csvLine.split(separator).slice(0, -1).join(separator));
										const linesToSaveIntoCsv = csvArrayContent.map((csvLine) =>
											csvLine.split(separator).slice(0, -1).join(separator)
										);
										if (fullHistoricalContent) {
											fullHistoricalContent +=
												'\n' + linesToSaveIntoCsv.map((csvLine) => `${fileName}.csv${separator}${csvLine}`).join('\n');
										} else {
											const csvArrayHeaderNewField = 'Arquivo' + separator + csvHeader;
											const csvContentNewField = linesToSaveIntoCsv.map(
												(csvLine) => `${fileName}.csv${separator}${csvLine}`
											);
											fullHistoricalContent = csvArrayHeaderNewField;
											if (csvContentNewField.length > 0) {
												fullHistoricalContent += '\n' + csvContentNewField.join('\n');
											}
										}
										const fullHistoricalFileDao = new FileDAO_1.FileDAO();
										fullHistoricalFileDao.file = Buffer.from(fullHistoricalContent, 'utf8');
										if (correctHistoricalContent) {
											correctHistoricalContent +=
												'\n' +
												linesCorrectToSaveIntoCsv.map((csvLine) => `${fileName}.csv${separator}${csvLine}`).join('\n');
										} else {
											const csvArrayHeaderNewField = 'Arquivo' + separator + csvHeader;
											const csvContentNewField = linesCorrectToSaveIntoCsv.map(
												(csvLine) => `${fileName}.csv${separator}${csvLine}`
											);
											correctHistoricalContent = csvArrayHeaderNewField;
											if (csvContentNewField.length > 0) {
												correctHistoricalContent += '\n' + csvContentNewField.join('\n');
											}
										}
										const correctHistoricalFileDao = new FileDAO_1.FileDAO();
										correctHistoricalFileDao.file = Buffer.from(correctHistoricalContent, 'utf8');
										let parametrizedCsv = csv
											.split('\n')
											.map((csvLine) => csvLine.split(separator).slice(0, -1).join(separator))
											.join('\n');
										const fileDao = new FileDAO_1.FileDAO();
										fileDao.file = Buffer.from(parametrizedCsv, 'utf8');
										parametrizedCsv += '\n\nConfiguracao versao' + separator + configVersion;
										parametrizedCsv += '\nConfiguracao inserida em' + separator + configTimestamp;
										if (err) reject(err);
										yield Promise.all([
											fullHistoricalFileDao.save(`${fullHistoricalFilePath}_${companyConfig.version}.csv`),
											correctHistoricalFileDao.save(`${correctHistoricalFilePath}_${companyConfig.version}.csv`),
											fileDao.save(filePath.replace('.csv', '_parametrizado.csv')),
										]);
										resolve(parametrizedCsv);
									}),
								{
									delimiter: {
										field: separator,
									},
								}
							);
						});
					})
				)
				.then((csv) => {
					res.setHeader('Content-disposition', 'attachment; filename=data.csv');
					res.set('Content-Type', 'text/csv; charset=utf-8');
					apiResponse.responseText = csv;
					apiResponse.statusCode = 200;
					res.status(apiResponse.statusCode).send(apiResponse.responseText);
				})
				.catch((err) => {
					if (apiResponse.statusCode === 200) {
						apiResponse.statusCode = 500;
					}
					apiResponse.responseText = 'Falha ao salvar o arquivo!';
					apiResponse.errorMessage = err.message;
				})
				.finally(() => {
					if (apiResponse.statusCode !== 200) {
						res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
					}
				});
		})
	);
};
exports.default = build;
