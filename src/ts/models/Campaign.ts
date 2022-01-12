export class Campaign {
	private _name: string;
	private _company: string;
	private _agency: string;
	private _campaignId: string;
	private _active: boolean;
	private _created: string;

	constructor(name: string, company: string, agency: string, campaignId: string, active: boolean, created: string) {
		this._name = name;
		this._company = company;
		this._agency = agency;
		this._campaignId = campaignId;
		this._active = active;
		this._created = created;
	}

	/**
	 * Gera um JSON correspondente ao objeto Campaign
	 * @returns JSON correspondente ao objeto Campaign
	 */
	public toJson(): { [key: string]: string | boolean } {
		return {
			name: this._name,
			company: this._company,
			agency: this._agency,
			campaignId: this._campaignId,
			created: this._created,
			active: this._active,
		};
	}

	/**
	 * Checa se há todas as informações de campanha vindas do Firestore
	 */
	public validateCampaignInfos(): boolean {
		return !(!this._name || !this._company || !this._agency || !this._campaignId || !this._active || !this._created);
	}

	get name(): string {
		return this._name;
	}

	get agency(): string {
		return this._agency;
	}

	get company(): string {
		return this._company;
	}

	get created(): string {
		return this._created;
	}

	get active(): boolean {
		return this._active;
	}

	get campaignId(): string {
		return this._campaignId;
	}
}
