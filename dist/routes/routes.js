'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('./config');
const csv_1 = require('./csv');
const template_1 = require('./template');
const build_1 = require('./build');
const register_1 = require('./register');
const user_1 = require('./user');
const login_1 = require('./login');
const campaign_1 = require('./campaign');
const adOpsTeam_1 = require('./adOpsTeam');
const routes = (app) => {
	(0, config_1.default)(app);
	(0, csv_1.default)(app);
	(0, template_1.default)(app);
	(0, build_1.default)(app);
	(0, register_1.default)(app);
	(0, user_1.default)(app);
	(0, login_1.default)(app);
	(0, campaign_1.default)(app);
	(0, adOpsTeam_1.default)(app);
};
exports.default = routes;
