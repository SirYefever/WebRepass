import {EditCourseStudentMarkModel, Mark, MarkType, StudentDataModel} from "../api/interfaces.ts";
import {changeAttestationMarkQuery} from "./singleCourseQueries.ts";
import {toggleFailurePopup, toggleSuccessPopup} from "../defaultPopups/defaultPopups.ts";
import {constructStudentsUl} from "./singleCourse.ts";

function popupRedactMark(markType: MarkType, studentData: StudentDataModel){
      toggleRedactMarkPopup();

      var saveButton = document.getElementById("confirm-redact-mark-button") as HTMLButtonElement;
      saveButton?.addEventListener("click", () => changeAttestationMark(studentData.id, markType))
      saveButton.disabled = true;
      var cancelButton = document.getElementById("cancel-redact-mark-button");
      cancelButton?.addEventListener("click", toggleRedactMarkPopup)

      const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;

      const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;

      successCheckbox.onclick = () => {
            successCheckbox.checked = false;
            failCheckbox.checked = false;

            successCheckbox.checked = true;
            saveButton.disabled = false;
      }
      failCheckbox.onclick = () => {
            successCheckbox.checked = false;
            failCheckbox.checked = false;

            failCheckbox.checked = true;
            saveButton.disabled = false;
      }
}

function toggleRedactMarkPopup(){
      var popup = document.getElementById("redact-mark-span");
      popup?.classList.toggle("show");
}


async function changeAttestationMark(studentId: string, markType: MarkType): Promise<void>{

      const successCheckbox = document.getElementById("success-checkbox") as HTMLInputElement;

      const failCheckbox = document.getElementById("fail-checkbox") as HTMLInputElement;

      let requestBody = {} as EditCourseStudentMarkModel;
      successCheckbox.checked ? requestBody = {mark: Mark[Mark.Passed], markType: MarkType[markType]} :
          failCheckbox.checked ? requestBody = {mark: Mark[Mark.Failed], markType: MarkType[markType]} : {};

      const response = await changeAttestationMarkQuery(studentId, requestBody);
      if (response.ok) {
            toggleRedactMarkPopup();
            toggleSuccessPopup();
            await constructStudentsUl();
      }
      else {
            toggleFailurePopup();
      }
}

export {popupRedactMark}