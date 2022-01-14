import { FirestoreConnectionSingleton } from '../cloud/FirestoreConnectionSingleton';
import { QuerySnapshot } from '@google-cloud/firestore';
import { ObjectStore } from './ObjectStore';
import { User } from '../User';

export class AdOpsTeamDAO {
	private _objectStore: ObjectStore;
	private _pathToCollection: string[];

	constructor() {
		this._objectStore = FirestoreConnectionSingleton.getInstance();
		this._pathToCollection = ['tokens'];
	}

	/**
	 * Retorna todas as agências de uma companhia
	 * @param advertiser Empresa(advertiser) das agências a serem buscados
	 * @param adOpsTeam Empresa(advertiser) das agências a serem buscados
	 * @param userRequestPermission permissão do usuario que solicitou a alteração
	 * @returns Lista de agências
	 */
	public getAllAdOpsTeamsFrom(advertiser: string, adOpsTeam: string, userRequestPermission: string): Promise<string[]> {
		return this._objectStore
			.getCollection(['tokens'])
			.where('advertiser', '==', advertiser)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot.size > 0) {
					if (userRequestPermission === 'adOpsTeamLeader' || userRequestPermission === 'user') {
						return [adOpsTeam];
					}
					const adOpsTeams: string[] = [];
					querySnapshot.forEach((documentSnapshot) => {
						const searchId = documentSnapshot.ref.path.match(new RegExp('[^/]+$'));
						if (searchId) {
							const userAdOpsTeam = documentSnapshot.get('adOpsTeam');
							if (userAdOpsTeam && !adOpsTeams.includes(userAdOpsTeam)) {
								adOpsTeams.push(userAdOpsTeam);
							}
						} else {
							throw new Error('Nenhuma agência encontrada!');
						}
					});
					return adOpsTeams;
				}
			})
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * Retorna todos os usuários de uma determinada agência
	 * @param advertiser Empresa(advertiser) dos usuários a serem buscados
	 * @param adOpsTeam Agência da qual usuários serão buscados
	 * @returns Lista de usuários
	 */
	public getAllUsersFromAdOpsTeam(advertiser: string, adOpsTeam: string): Promise<User[] | void> {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('advertiser', '==', advertiser)
			.get()
			.then((querySnapshot: QuerySnapshot) => {
				if (querySnapshot.size > 0) {
					const users: User[] = [];
					querySnapshot.forEach((documentSnapshot) => {
						const searchId = documentSnapshot.ref.path.match(new RegExp('[^/]+$'));
						if (searchId) {
							const userPermission = documentSnapshot.get('permission');
							const userAdOpsTeam = documentSnapshot.get('adOpsTeam');
							if ((userPermission === 'adOpsTeamLeader' || userPermission === 'user') && userAdOpsTeam === adOpsTeam) {
								const user = new User(
									searchId[0],
									userPermission,
									documentSnapshot.get('advertiser'),
									documentSnapshot.get('email'),
									documentSnapshot.get('active'),
									documentSnapshot.get('adOpsTeam')
								);
								users.push(user);
							}
						} else {
							throw new Error('Nenhum usuário encontrado!');
						}
					});
					return users;
				}
			})
			.catch((err) => {
				throw err;
			});
	}
}
