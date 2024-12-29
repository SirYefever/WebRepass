
import profileHTML from './profile.html?raw'
import {constructPage2, makeSubMainContainerVisible, refillSubMainContainer} from '../index/index'
import { constructPage } from '../index/index'
import { ProfileData } from "../LocalDataStorage.ts";
import { ProfileApiResponse as ProfileApiInterface } from '../api/interfaces.ts';
import { AuthData } from '../LocalDataStorage.ts';

async function profileGetRequest(): Promise<ProfileApiInterface> {
    let authData = new AuthData();
    const response = await fetch("https://mis-api.kreosoft.space/api/doctor/profile", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authData.token,
        },
    })
    if (response.ok) {
        return (await response.json()) as ProfileApiInterface;
    }
    throw response;
}

async function redactProfileLogic() {
    const name = document.getElementById('name-input')! as HTMLInputElement;
    const birth = document.getElementById('birth-day-selector')! as HTMLInputElement;
    let newProfileData: ProfileApiInterface = {fullName: name.value, birthDate: birth.value};
    newProfileData.birthDate = birth.value;
    newProfileData.fullName = name.value;
    const token = new AuthData().token;
    profilePutRequest(newProfileData);
}

async function profilePutRequest(newProfileData: ProfileApiInterface)  {
    let authData = new AuthData();
    const response = await fetch("https://camp-courses.api.kreosoft.space/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authData.token,
        },
        body: JSON.stringify(newProfileData),
    })
    if (response.ok) {
        return (await response.json()) as ProfileApiInterface;
    }
    throw response;
}

async function profileLogic() {
    console.log("profile fired");
    let profileStorage = new ProfileData();
    const profile = await profileGetRequest();
    profileStorage.name = profile.name!;
    profileStorage.birthday = profile.birthday!;
    profileStorage.email = profile.email!;
    // window.location.assign('/');
}

function profileConstructor() {
    let authData = new AuthData();
    if (!authData.IsLoggedIn()) {
        return;
    }
    constructPage2(profileHTML, "/src/profile/profile.css");
    let saveChangesButton = document.getElementById('save-changes-button');
    if (saveChangesButton !== null) {
        saveChangesButton.onclick = redactProfileLogic;
    }
    makeSubMainContainerVisible();
}

export { profileLogic, profileGetRequest as profileRequest, profileConstructor }
