'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Campaign = void 0;
class Campaign {
	constructor(name, company, agency, campaignId, active, created) {
		this._name = name;
		this._company = company;
		this._agency = agency;
		this._campaignId = campaignId;
		this._active = active;
		this._created = created;
	}
	toJson() {
		return {
			name: this._name,
			company: this._company,
			agency: this._agency,
			campaignId: this._campaignId,
			created: this._created,
			active: this._active,
		};
	}
	validateCampaignInfos() {
		return !(!this._name || !this._company || !this._agency || !this._campaignId || !this._active || !this._created);
	}
	get name() {
		return this._name;
	}
	get agency() {
		return this._agency;
	}
	get company() {
		return this._company;
	}
	get created() {
		return this._created;
	}
	get active() {
		return this._active;
	}
	get campaignId() {
		return this._campaignId;
	}
}
exports.Campaign = Campaign;
