import { updateUser } from './register.js';
import { displayProfilPage } from './display_page_function.js'
import { updateValidationState, myInput, letter, capital, number, length, ForbiddenCharElement } from './parsingPwd.js'; // Importer les variables et la fonction updateValidationState depuis un fichier parsingPwd.js
import { registerUser } from './register.js'; // Importer la fonction registerUser depuis un fichier register.js

function removeCharactersAfterLastSlash(str) {
	const lastSlashIndex = str.lastIndexOf('/');
	if (lastSlashIndex !== -1) {
		return str.substring(0, lastSlashIndex + 1);
	} else {
		return str;
	}
  }

async function updateFormParse() {
  var inputUsername = document.getElementById('updateUsername');   // update page parsing
  var userName = inputUsername.value;
  var username_regex = /^[a-zA-Z0-9-_]+$/;


  var inputEmail = document.getElementById('updateEmail');
  var userEmail = inputEmail.value;
  var regex = /\S+@\S+\.\S+/;
  var secRegexEmail = /^[a-zA-Z0-9@.-]+$/;

  var inputPassword = document.getElementById('updatePassword');
  var userPassword = inputPassword.value;
  var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  let isValid = true;

  if (username_regex.test(userName) || (userName === null || userName === undefined || userName === '')) {
    document.getElementById('updateUsernameError').innerHTML = '';
  }
  else {
    updateUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
    isValid = false;
  }
  if ((regex.test(userEmail) && secRegexEmail.test(userEmail)) || (userEmail === null || userEmail === undefined || userEmail === '')) {
    document.getElementById('updateEmailError').innerHTML = '';
  }
  else {
    updateEmailError.textContent = 'Please enter a valid e-mail address.';
    // inputEmail.classList.add('error');
    console.log("Email not valid");
    isValid = false;
  }
  if (password_regex.test(userPassword) || (userPassword === null || userPassword === undefined || userPassword === '')) {
    document.getElementById('updatePasswordError').innerHTML = '';
  }
  else {
    updatePasswordError.textContent = "Password must contain the following: lowercase letter, uppercase letter, number, 8 characters and special character(!@#$%&?)"
    console.log("Username not valide");
    isValid = false;
  }
  if (isValid) {
    await updateUser();
    document.getElementById('update_form').reset();
    if (userName)
    {
      var path = removeCharactersAfterLastSlash(window.location.pathname);
      var newPath = path + userName;
      displayProfilPage(newPath);
    }
    else if (userEmail)
    {
      displayProfilPage(window.location.pathname);
    }
  }
  else {
    console.log("Form not valid");
  }
}

async function inputRegisterForm() {

	var inputUsername = document.getElementById('inputUsername');   // register page parsing
	var userName = inputUsername.value;
	var username_regex = /^[a-zA-Z0-9-_]+$/;
  
  
	var inputEmail = document.getElementById('inputEmail');
	var userEmail = inputEmail.value;
	var regex = /\S+@\S+\.\S+/;
	var secRegexEmail = /^[a-zA-Z0-9@.-]+$/;
  
	var count = 0;
  
	if (username_regex.test(userName)) {
	  document.getElementById('usernameError').innerHTML = '';
	  count++;
	}
	else {
	  usernameError.textContent = "Please enter letters, numbers, '-' or '_'."
	  console.log("Username not valide");
	}
	if (regex.test(userEmail) && secRegexEmail.test(userEmail)) {
	  document.getElementById('emailError').innerHTML = '';
	  count++;
	}
	else {
	  emailError.textContent = 'Please enter a valid e-mail address.';
	  // inputEmail.classList.add('error');
	  console.log("Email not valid");
	}
	var isPwdValid = updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement);
	if (isPwdValid && count == 2) {
	  registerUser();
	  document.getElementById('register_form').reset();
	  updateValidationState(); // Reset the color of pwd_checkbox
	}
	else {
	  console.log("Form not valid");
	}
}

export { updateFormParse, inputRegisterForm };