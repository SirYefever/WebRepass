import {AuthData} from "../LocalDataStorage.ts";
import {UserModel, UserRoles} from "../api/interfaces.ts";

function getPrefixUntilChar(str: string, char: string): string {
    const index = str.indexOf(char);
    return index !== -1 ? str.slice(0, index) : str;
}

let popup = async (): Promise<HTMLDivElement> => {
    let popupDiv = document.createElement("div") as HTMLDivElement;
    popupDiv.classList.add('overlay-div');
    popupDiv.id ="overlay-div";
    popupDiv.innerHTML = `
            <div class="popup-div">
                    <p class="regPar par201">Регистрация пациента</p>
                    <p class="grayText">ФИО</p><input placeholder="Иванов Иван Иванович" class="regInput" id="name-input">
                    <div class="div234">
                        <div class="flexDivVert">
                            <p class="grayText">Пол</p>
                            <select class="selectElement" id="gender-select">
                                <option>Мужской</option>
                                <option>Женский</option>
                            </select>
                        </div>
                        <div class="flexDivVert">
                            <p class="grayText">Дата рождения</p>
                            <input type="date" id="birthday-select" />
                        </div>
                    </div>
                    <button class="lightBlueButton" id="reg-button">Зарегестрировать</button>
            </div>
    `;
    return popupDiv;
}

async function getUserRoles(): Promise<UserRoles>{
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

function isNullOrEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0;
}

function compareUsersAlphabetically(firstUser: UserModel, secondUser: UserModel){
    return firstUser.fullName.localeCompare(secondUser.fullName);
}

function fillTeacherSelectWithUsers(users: UserModel[], teacherSelectId: string) {
    let newTeacherSelect = document.getElementById(teacherSelectId) as HTMLSelectElement;
    newTeacherSelect.innerHTML = "";
    users.sort(compareUsersAlphabetically);
    users.forEach(user => {
        const newOption = document.createElement("option");
        newOption.textContent = user.fullName;
        newOption.dataset.info = user.id;
        newOption.classList.add("teacher-option");
        newTeacherSelect?.appendChild(newOption);
    })
}

export { fillTeacherSelectWithUsers, compareUsersAlphabetically, isNullOrEmpty, getUserRoles, getPrefixUntilChar, popup }