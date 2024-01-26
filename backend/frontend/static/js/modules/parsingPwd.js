var myInput = document.getElementById("inputPassword");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");
var ForbiddenCharElement = document.getElementById("forbiddenChar");

// When the user clicks on the password field, show the pwd_checkbox box
myInput.onfocus = function() {
  document.getElementById("pwd_checkbox").style.display = "block";
}

// When the user clicks outside of the password field, hide the pwd_checkbox box
myInput.onblur = function() {
  setTimeout(() => {
    document.getElementById("pwd_checkbox").style.display = "none";
  }, 100);
}
export function updateValidationState() {
  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  console.log("A");
  var hasLowerCase = myInput.value.match(lowerCaseLetters);
  console.log("B");
  updateValidationClass(letter, hasLowerCase);
  console.log("C");

  // Validate capital letters
  var upperCaseLetters = /[A-Z]/g;
  var hasUpperCase = myInput.value.match(upperCaseLetters);
  updateValidationClass(capital, hasUpperCase);

  // Validate numbers
  var numbers = /[0-9]/g;
  var hasNumbers = myInput.value.match(numbers);
  updateValidationClass(number, hasNumbers);

  // Validate length
  var hasValidLength = myInput.value.length >= 8;
  updateValidationClass(length, hasValidLength);

  // Validate special characters
  var ForbiddenCharRegex = /[@$!%#?&]/
  var hasForbiddenChar = myInput.value.match(ForbiddenCharRegex);
  updateValidationClass(ForbiddenCharElement, hasForbiddenChar);

  // Return true if all criteria are met, otherwise return false
  return myInput.checkValidity();
}

export function updateValidationClass(element, isValid) {
  if (isValid) {
    element.classList.remove("invalid");
    element.classList.add("valid");
  } else {
    element.classList.remove("valid");
    element.classList.add("invalid");
  }
}

// When the user starts to type something inside the password field
myInput.onkeyup = function() {
  // Perform the validation
  var isValid = updateValidationState();
  console.log(isValid);
};

export { myInput, letter, capital, number, length, ForbiddenCharElement }

