import {registerUser} from "../register.js"

function put_register_form_html() {
    var register_form = document.getElementById("register");
    register_form.innerHTML = `  
    <form id="register_form"> 
        <div class="card">
            <div class="card-body">        
                <label for="inputUsername" class="form-label">Username</label>
                <input type="text" class="form-control" id="inputUsername" placeholder="Username" maxlength="16" required/>
                <span id="usernameError" class="error-message"></span>

                <label for="inputEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="inputEmail" placeholder="yourmail@random.com" maxlength="50" required/>
                <span id="emailError" class="error-message"></span>


                <label for="inputPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="inputPassword" placeholder="Password" maxlength="16" />
            <div id="pwd_checkbox">
                <h3>Password must contain the following:</h3>
                <p id="letter" class="invalid">A <b>lowercase</b> letter</p>
                <p id="capital" class="invalid">A <b>capital (uppercase)</b> letter</p>
                <p id="number" class="invalid">A <b>number</b></p>
                <p id="length" class="invalid">Minimum <b>8 characters</b></p>
                <p id="forbiddenChar" class="invalid">A <b>special characters (@$!%#?&)</b></p>
            </div>
            
            </div>
            <div class="card-footer text-center">
            <button class="btn btn-primary" id="register_button">register</button>
            </div>
        </div>
    </form>
    `;

    var myInput = document.getElementById("inputPassword");
    var letter = document.getElementById("letter");
    var capital = document.getElementById("capital");
    var number = document.getElementById("number");
    var length = document.getElementById("length");
    var ForbiddenCharElement = document.getElementById("forbiddenChar");

    myInput.onfocus = function() {
    document.getElementById("pwd_checkbox").style.display = "block";
    }

    // When the user clicks outside of the password field, hide the pwd_checkbox box
    myInput.onblur = function() {
    setTimeout(() => {
        document.getElementById("pwd_checkbox").style.display = "none";
    }, 100);
    }

    myInput.onkeyup = function() {
    // Perform the validation
    var isValid = updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement);
    console.log(isValid);
    };

    const registerForm = document.getElementById('register_form')
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        inputRegisterForm(myInput, letter, capital, number, length, ForbiddenCharElement);
    });
}

async function inputRegisterForm(myInput, letter, capital, number, length, ForbiddenCharElement) {

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
	  updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement); // Reset the color of pwd_checkbox
	}
	else {
	  console.log("Form not valid");
	}
}

export function updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement) {
  
    // When the user clicks on the password field, show the pwd_checkbox box

  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  var hasLowerCase = myInput.value.match(lowerCaseLetters);
  updateValidationClass(letter, hasLowerCase);

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


export { put_register_form_html }