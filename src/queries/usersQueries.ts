import {UserModel, UserRoles} from "../api/interfaces.ts";
import {AuthData, ProfileData} from "../LocalDataStorage.ts";

export let userRoles: UserRoles;

async function fetchUsers():Promise<UserModel[] | undefined>{
        const authData = new AuthData();
        const response = await fetch("https://camp-courses.api.kreosoft.space/users", {
                method: "GET",
                headers: {
                        "Authorization": "Bearer " + authData.token,
                        "Content-Type": "application/json"
                },
        })
        if (response.ok) {
                return response.json();
        }
}

async function setUserRoles(): Promise<void>{
        const profileData = new ProfileData();
        // const test = new LocalDataStorage();
        const authData = new AuthData();
        const response = await fetch("https://camp-courses.api.kreosoft.space/roles", {
                method: "GET",
                headers: {
                        Authorization: "Bearer " + authData.token
                }
        })
        if (response.ok) {
                profileData.userRoles = await response.json();
                // test.userRoles = await response.json();
        } else {
                throw response;
        }
}

export {fetchUsers, setUserRoles}