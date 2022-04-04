import { ApiResponse } from '../models/ApiResponse';
import { AdOpsTeamDAO } from '../models/DAO/AdOpsTeamDAO';
import { User } from '../models/User';

const adOpsTeam = (app: { [key: string]: any }): void => {
	app.get('/adOpsTeam/list', async (req: { [key: string]: any }, res: { [key: string]: any }) => {
		const apiResponse = new ApiResponse();

		const advertiser = req.advertiser;
		const adOpsTeam = req.adOpsTeam;
		const permission = req.permission;

		new AdOpsTeamDAO()
			.getAllAdOpsTeamsFrom(advertiser, adOpsTeam, permission)
			.then((adOpsTeams: string[]) => {
				apiResponse.responseText = JSON.stringify(adOpsTeams);
			})
			.catch((err) => {
				apiResponse.statusCode = 500;
				apiResponse.responseText = err.message;
				apiResponse.errorMessage = err.message;
			})
			.finally(() => {
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
			});
	});

	app.get('/adOpsTeam/users', async (req: { [key: string]: any }, res: { [key: string]: any }) => {
		const apiResponse = new ApiResponse();
		const advertiser = req.advertiser;
		const adOpsTeam = req.adOpsTeam;
		const userid = req.userid;

		new AdOpsTeamDAO()
			.getAllUsersFromAdOpsTeam(advertiser, adOpsTeam, userid)
			.then((users: User[]) => {
				apiResponse.responseText = JSON.stringify(users.map((user: User) => user.toJson()));
			})
			.catch((err) => {
				apiResponse.statusCode = 500;
				apiResponse.responseText = err.message;
				apiResponse.errorMessage = err.message;
			})
			.finally(() => {
				res.status(apiResponse.statusCode).send(apiResponse.jsonResponse);
			});
	});
};
export default adOpsTeam;
