import {AuthData} from "../LocalDataStorage.ts";
import {UserInfoModel} from "../api/interfaces.ts";

async function getCurrentUserProfileInfoQuery(): Promise<UserInfoModel>{
    const authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/profile", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + authData.token
        }
    })
    if (response.ok) {
        return await response.json() as UserInfoModel;
    } else {
        console.error("Unable to get Current User Profile");
        throw response;
    }
}

export {getCurrentUserProfileInfoQuery}