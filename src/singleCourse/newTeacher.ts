import {AddTeacherToCourseModel, UserModel} from "../api/interfaces.ts";
import {AuthData} from "../LocalDataStorage.ts";
import {fetchUsers} from "../queries/usersQueries.ts";
import {fillTeacherSelectWithUsers} from "../utils/utils.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";

async function initNewTacherPopup(){
      const saveButton = document.getElementById("save-new-teacher-button") as HTMLButtonElement;
      saveButton.addEventListener("click", async () => {
            const newTeacherSelect = document.getElementById("new-teacher-select") as HTMLSelectElement;
            console.log(newTeacherSelect.selectedOptions[0].dataset.info);
            const newTeacher = {userId: newTeacherSelect.selectedOptions[0].dataset.info} as AddTeacherToCourseModel;
            await newTeacherQuery(newTeacher);
            newTeacherPopupOff();
      })

      const cancelButton = document.getElementById("cancel-new-teacher") as HTMLButtonElement;
      cancelButton.addEventListener("click", () => {
            newTeacherPopupOff();
      })

      const userList = await fetchUsers() as UserModel[];
      fillTeacherSelectWithUsers(userList, "new-teacher-select");

      const newTeacherInput = document.getElementById("new-teacher-input") as HTMLInputElement;
      newTeacherInput.onchange = () => {
            var subUsers = [] as UserModel[];
            userList.forEach(user => {
                  if (user.fullName.includes(newTeacherInput.value)) {
                        subUsers.push(user);
                  }
            });
            fillTeacherSelectWithUsers(subUsers, "new-teacher-select");
      }
}


function newTeacherPopupOn(){
      var popup = document.getElementById("add-new-teacher-span");
      popup?.classList.add("show");
}

function newTeacherPopupOff(){
      var popup = document.getElementById("add-new-teacher-span");
      popup?.classList.remove("show");
}

async function newTeacherQuery(teacher: AddTeacherToCourseModel){
      const urlSplit = window.location.pathname.split("/");
      const courseId = urlSplit[urlSplit.length - 1];
      const authData = new AuthData();
      const response = await fetch("https://camp-courses.api.kreosoft.space/courses/" + courseId + "/teachers", {
            method: "POST",
            headers: {
                  Authorization: "Bearer " + authData.token,
                  "Content-Type": "application/json"
            },
            body: JSON.stringify(teacher)
      });
      if (response.ok) {
            toggleSuccessPopup();
            return (await response.json());
      }
      toggleFailurePopup();
      throw response;
}

export {initNewTacherPopup, newTeacherPopupOn}