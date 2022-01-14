'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AdOpsTeamDAO = void 0;
const FirestoreConnectionSingleton_1 = require('../cloud/FirestoreConnectionSingleton');
const User_1 = require('../User');
class AdOpsTeamDAO {
	constructor() {
		this._objectStore = FirestoreConnectionSingleton_1.FirestoreConnectionSingleton.getInstance();
		this._pathToCollection = ['tokens'];
	}
	getAllAdOpsTeamsFrom(advertiser, adOpsTeam, userRequestPermission) {
		return this._objectStore
			.getCollection(['tokens'])
			.where('advertiser', '==', advertiser)
			.get()
			.then((querySnapshot) => {
				if (querySnapshot.size > 0) {
					if (userRequestPermission === 'adOpsTeamLeader' || userRequestPermission === 'user') {
						return [adOpsTeam];
					}
					const adOpsTeams = [];
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
	getAllUsersFromAdOpsTeam(advertiser, adOpsTeam) {
		return this._objectStore
			.getCollection(this._pathToCollection)
			.where('advertiser', '==', advertiser)
			.get()
			.then((querySnapshot) => {
				if (querySnapshot.size > 0) {
					const users = [];
					querySnapshot.forEach((documentSnapshot) => {
						const searchId = documentSnapshot.ref.path.match(new RegExp('[^/]+$'));
						if (searchId) {
							const userPermission = documentSnapshot.get('permission');
							const userAdOpsTeam = documentSnapshot.get('adOpsTeam');
							if ((userPermission === 'adOpsTeamLeader' || userPermission === 'user') && userAdOpsTeam === adOpsTeam) {
								const user = new User_1.User(
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
exports.AdOpsTeamDAO = AdOpsTeamDAO;
