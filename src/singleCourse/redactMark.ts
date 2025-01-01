import {EditCourseStudentMarkModel, Mark, MarkType, StudentDataModel} from "../api/interfaces.ts";
import {changeAttestationMarkQuery} from "./singleCourseQueries.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";
import {constructStudentsUl} from "./singleCourse.ts";


function initRedactMarkPopup(){
      var cancelButton = document.getElementById("cancel-redact-mark-button");
      cancelButton?.addEventListener("click", toggleRedactMarkPopupOff)
}

function toggleRedactMarkPopupOn(markType: MarkType, studentData: StudentDataModel) {
      const popup = document.getElementById("redact-mark-span");
      popup?.classList.add("show");

      const saveButton = document.getElementById("confirm-redact-mark-button") as HTMLButtonElement;
      const newSaveButton = saveButton.cloneNode(true) as HTMLButtonElement;
      newSaveButton.addEventListener("click", () => changeAttestationMark(studentData.id, markType));
      saveButton.parentNode?.replaceChild(newSaveButton, saveButton);
      newSaveButton.disabled = true;

      const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;
      successCheckbox.checked = false;

      const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;
      failCheckbox.checked = false;

      successCheckbox.onclick = () => {
            failCheckbox.checked = false;

            successCheckbox.checked = true;
            newSaveButton.disabled = false;
      }
      failCheckbox.onclick = () => {
            successCheckbox.checked = false;

            failCheckbox.checked = true;
            newSaveButton.disabled = false;
      }
}

function toggleRedactMarkPopupOff(){
      var popup = document.getElementById("redact-mark-span");
      popup?.classList.remove("show");


      const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;
      successCheckbox.checked = false;

      const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;
      failCheckbox.checked = false;
}

async function changeAttestationMark(studentId: string, markType: MarkType): Promise<void>{

      const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;

      const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;

      let requestBody = {} as EditCourseStudentMarkModel;
      successCheckbox.checked ? requestBody = {mark: Mark[Mark.Passed], markType: MarkType[markType]} :
          failCheckbox.checked ? requestBody = {mark: Mark[Mark.Failed], markType: MarkType[markType]} : {};

      const response = await changeAttestationMarkQuery(studentId, requestBody);
      if (response.ok) {
            toggleRedactMarkPopupOff();
            toggleSuccessPopup();
            await constructStudentsUl();
      }
      else {
            toggleFailurePopup();
      }
}

export { toggleRedactMarkPopupOn, toggleRedactMarkPopupOff, initRedactMarkPopup }