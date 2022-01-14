import { ObjectStore } from './ObjectStore';
import { FirestoreConnectionSingleton } from '../cloud/FirestoreConnectionSingleton';
import { CollectionReference, QuerySnapshot } from '@google-cloud/firestore';
import { Campaign } from '../Campaign';

export class CampaignDAO {
	private _campaignName: string;
	private _adOpsTeam: string;
	private _objectStore: ObjectStore;
	private _authCollection: CollectionReference;
	private _pathToCollection: string[];

	constructor(campaign?: string, adOpsTeam?: string) {
		this._campaignName = campaign;
		this._adOpsTeam = adOpsTeam;
		this._objectStore = FirestoreConnectionSingleton.getInstance();
		this._pathToCollection = ['campaigns'];
		this._authCollection = this._objectStore.getCollection(this._pathToCollection);
	}

	/**
	 * Consulta a campanha na base de dados
	 * @returns Retorna campanha procurada
	 */
	public getCampaign(campaignId: string): Promise<string | void> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('campaignId', '==', campaignId)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot.size > 0) {
					let campaign: string;
					querySnapshot.forEach((documentSnapshot) => {
						if (documentSnapshot.get('name')) {
							campaign = documentSnapshot.get('name');
						} else {
							throw new Error('Nenhuma campanha encontrada!');
						}
					});
					return campaign;
				} else {
					throw new Error('Nenhuma campanha encontrada!');
				}
			})
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * Retorna todas as agências de uma companhia
	 * @param adOpsTeam Agência das campanhas a serem buscados
	 * @param userRequestPermission permissão do usuario que solicitou a alteração
	 * @returns Lista Objetos contendo atributos de cada campanha
	 */
	public getAllCampaignsFrom(
		adOpsTeam: string,
		userRequestPermission: string
	): Promise<{ campaignName: string; campaignId: string; adOpsTeam: string; active: boolean }[]> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('adOpsTeam', '==', adOpsTeam)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (!adOpsTeam && (userRequestPermission === 'user' || userRequestPermission === 'adOpsTeamLeader')) {
					throw new Error('Nenhuma campanha foi selecionada!');
				}
				if (querySnapshot.size > 0) {
					const adOpsTeamName = adOpsTeam !== 'Campanhas Internas' ? adOpsTeam : 'AdvertiserCampaigns';
					const campaigns: { campaignName: string; campaignId: string; adOpsTeam: string; active: boolean }[] = [];
					querySnapshot.forEach((documentSnapshot) => {
						const documentAdOpsTeam = documentSnapshot.get('adOpsTeam');
						if (adOpsTeamName === documentAdOpsTeam) {
							const campaignInfos: { campaignName: string; campaignId: string; adOpsTeam: string; active: boolean } = {
								campaignName: documentSnapshot.get('name'),
								campaignId: documentSnapshot.get('campaignId'),
								adOpsTeam: documentSnapshot.get('adOpsTeam'),
								active: documentSnapshot.get('active'),
							};
							if (
								campaignInfos.campaignName &&
								campaignInfos.campaignId &&
								campaignInfos.adOpsTeam &&
								campaignInfos.active !== null &&
								campaignInfos.active !== undefined &&
								!campaigns.includes(campaignInfos)
							) {
								campaigns.push(campaignInfos);
							} else {
								throw new Error('Erro na recuperação dos atributos da campanha ' + documentSnapshot.get('name') + '!');
							}
						} else {
							throw new Error('Nenhuma campanha encontrada!');
						}
					});
					return campaigns;
				}
			})
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * Adiciona uam nova campanha na base de dados
	 * @param campaign Campanha a ser adicionada
	 * @returns Booleano indicando sucesso ou fracasso da criação do usuário
	 */
	public addCampaign(campaign: Campaign): Promise<boolean> {
		return this._objectStore
			.addDocumentIn(this._authCollection, campaign.toJson(), campaign.name + ' - ' + campaign.adOpsTeam)
			.get()
			.then(() => {
				return true;
			})
			.catch((err) => {
				console.log(err);
				return false;
			});
	}

	/**
	 * Busca o ID do campanha na base de dados
	 * @returns ID do campanha
	 */
	public getCampaignId(): Promise<string | void> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('name', '==', this._campaignName)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot.size > 0) {
					querySnapshot.forEach((documentSnapshot) => {
						const id = documentSnapshot.get('campaignId');
						if (this._adOpsTeam === documentSnapshot.get('adOpsTeam')) {
							return id;
						} else {
							throw new Error('Falha ao recuperar o ID da campanha!');
						}
					});
				} else {
					throw new Error('ID não encontrado!');
				}
			})
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * Desativa uma campanha
	 * @param campaignId ID da campanha a ser desativada
	 * @param userRequestPermission permissão do usuario que solicitou a alteração
	 * @returns retorna True em caso de sucesso
	 */
	public deactivateCampaign(campaignId: string, userRequestPermission: string): Promise<boolean | void> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('campaignId', '==', campaignId)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot) {
					querySnapshot.forEach((doc) => {
						const campaign = doc.data();
						if (userRequestPermission !== 'user') {
							campaign.active = false;
						} else {
							throw new Error('Permissões insuficientes para inavitar a campanha!');
						}
						return doc.ref.set(campaign);
					});
				} else {
					throw new Error('ID não encontrado!');
				}
			})
			.then(() => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * Resativa um usuário
	 * @param campaignName ID da campanha a ser reativada
	 * @param userRequestPermission permissão do usuario que solicitou a alteração
	 * @returns retorna True em caso de sucesso
	 */
	public reactivateCampaign(campaignId: string, userRequestPermission: string): Promise<boolean | void> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('campaignId', '==', campaignId)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot) {
					querySnapshot.forEach((doc) => {
						const campaign = doc.data();
						if (userRequestPermission !== 'user') {
							campaign.active = true;
						} else {
							throw new Error('Permissões insuficientes para reativar a campanha!');
						}
						return doc.ref.set(campaign);
					});
				} else {
					throw new Error('ID não encontrado!');
				}
			})
			.then(() => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	}
}
