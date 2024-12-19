
import profileHTML from './profile.html?raw'
import { refillSubMainContainer } from '../index/index'
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
    const gender = document.getElementById('gender-input')! as HTMLInputElement;
    const birth = document.getElementById('birthDateSelector')! as HTMLInputElement;
    const phone = document.getElementById('telephoneSelector')! as HTMLInputElement;
    const emailInput = document.getElementById('emailSelector')! as HTMLInputElement;
    let newProfileData: ProfileApiInterface = {};
    newProfileData.birthday = birth.value;
    newProfileData.email = emailInput.value;
    if (gender.value === 'Мужской') {
        newProfileData.gender = 'Male';
    }
    else {
        newProfileData.gender = 'Female';
    }
    newProfileData.name = name.value;
    newProfileData.phone = phone.value;
    const token = new AuthData().token;
    profilePutRequest(newProfileData);

}

async function profilePutRequest(newProfileData: ProfileApiInterface)  {
    let authData = new AuthData();
    const response = await fetch("https://mis-api.kreosoft.space/api/doctor/profile", {
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
    profileStorage.gender = profile.gender!;
    profileStorage.phone = profile.phone!;
    profileStorage.email = profile.email!;
    // window.location.assign('/');
}

function profileConstructor() {
    let authData = new AuthData();
    if (!authData.IsLoggedIn()) {
        return;
    }
    constructPage(profileHTML);
    let saveChangesButton = document.getElementById('save-changes-button');
    if (saveChangesButton !== null) {
        saveChangesButton.onclick = redactProfileLogic;
    }
}

export { profileLogic, profileGetRequest as profileRequest, profileConstructor }
