
function toggleSuccessPopup(){
      removeExistingPopup();

      var popupDiv = document.createElement("div");
      popupDiv.classList.add("popup");
      popupDiv.classList.add("success-div");
      popupDiv.id = "success-div";

      var popupSpan = document.createElement("span");
      popupSpan.classList.add("popuptext");
      popupSpan.classList.add("success-popup-span");
      popupSpan.id = "success-popup-span";

      var popupPar = document.createElement("p");
      popupPar.textContent = "Success";

      popupSpan.appendChild(popupPar);
      popupDiv.appendChild(popupSpan);

      const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
      popupStack?.appendChild(popupDiv);

      popupSpan?.classList.toggle("show");
      setTimeout(() => {
            popupSpan?.classList.add("fade-out");
            setTimeout(() => {
                  popupSpan?.classList.toggle("show")
                  popupSpan?.classList.remove("fade-out");
                  popupDiv.remove();
            }, 500);
      }, 1500);
}


function toggleFailurePopup(){
      removeExistingPopup();

      var popupDiv = document.createElement("div");
      popupDiv.classList.add("popup");
      popupDiv.classList.add("failure-div");
      popupDiv.id = "failure-div";

      var popupSpan = document.createElement("span");
      popupSpan.classList.add("popuptext");
      popupSpan.classList.add("failure-popup-span");
      popupSpan.id = "failure-popup-span";

      var popupPar = document.createElement("p");
      popupPar.textContent = "Fail";

      popupSpan.appendChild(popupPar);
      popupDiv.appendChild(popupSpan);

      const popupStack = document.getElementById("popup-stack") as HTMLDivElement;
      popupStack?.appendChild(popupDiv);

      popupSpan?.classList.toggle("show");
      setTimeout(() => {
            popupSpan?.classList.add("fade-out");
            setTimeout(() => {
                  popupSpan?.classList.toggle("show")
                  popupSpan?.classList.remove("fade-out");
                  popupDiv.remove();
            }, 500);
      }, 1500);
}

function removeExistingPopup(){
      const failurePopup = document.getElementById("failure-div")
      if (failurePopup){
            failurePopup.remove();
      }
      const successPopup = document.getElementById("success-div")
      if (successPopup){
            successPopup.remove();
      }
}

export {toggleSuccessPopup, toggleFailurePopup}