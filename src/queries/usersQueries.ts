import {UserModel, UserRoles} from "../api/interfaces.ts";
import {AuthData} from "../LocalDataStorage.ts";

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

async function getUserRolesFast(): Promise<UserRoles>{
        if (userRoles !== undefined){
                return userRoles;
        }

        const authData = new AuthData();
        const response = await fetch("https://camp-courses.api.kreosoft.space/roles", {
                method: "GET",
                headers: {
                        Authorization: "Bearer " + authData.token
                }
        })
        if (response.ok) {
                return (await response.json());
        }
        throw response;
}

export {fetchUsers, getUserRolesFast}