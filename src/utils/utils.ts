import {AuthData} from "../LocalDataStorage.ts";

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

async function getUserRoles(){
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


export {getUserRoles, getPrefixUntilChar, popup }