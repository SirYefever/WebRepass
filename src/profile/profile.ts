
import profileHTML from './profile.html?raw'
import {constructPage2, makeSubMainContainerVisible} from '../index/index'
import { ProfileData } from "../LocalDataStorage.ts";
import {ProfileApiResponse as ProfileApiInterface} from '../api/interfaces.ts';
import { AuthData } from '../LocalDataStorage.ts';
import {getCurrentUserProfileInfoQuery} from "../queries/accountQueries.ts";

async function redactProfileLogic() {
    const profileData = new ProfileData();
    const name = document.getElementById('name-input')! as HTMLInputElement;
    const birth = document.getElementById('birth-day-selector')! as HTMLInputElement;
    let newProfileData: ProfileApiInterface = {fullName: name.value, birthDate: birth.value, email: profileData.email};
    newProfileData.birthDate = birth.value;
    newProfileData.fullName = name.value;
    await profilePutRequest(newProfileData);
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
    const profile = await getCurrentUserProfileInfoQuery();
    profileStorage.name = profile.fullname!;
    profileStorage.birthday = profile.birthDate!;
    profileStorage.email = profile.email!;
    // window.location.assign('/');
}

async function profileConstructor() {
    let authData = new AuthData();
    const profileData = new ProfileData();
    if (!authData.IsLoggedIn()) {
        return;
    }
    constructPage2(profileHTML, "/src/profile/profile.css");

    const emailPar = document.getElementById('user-email-par') as HTMLParagraphElement;
    emailPar.textContent = profileData.email;

    let saveChangesButton = document.getElementById('save-changes-button') as HTMLButtonElement;
    if (saveChangesButton !== null) {
        saveChangesButton.onclick = redactProfileLogic;
    }
    makeSubMainContainerVisible();
}

export { profileLogic, profileConstructor }
