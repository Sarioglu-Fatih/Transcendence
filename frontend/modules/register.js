function displayRegisterForm() {

    const MyForm = document.getElementById('div_register_form');
  
    MyForm.innerHTML = `
      <form id="register_form" class="register_form">
        <div>
          <label for="inputUsername" class="form-label">Username</label>
          <input type="text" class="form-control" id="inputUsername" >
        </div>
  
        <div>
          <label for="inputEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="inputEmail" >
        </div>
  
        <div>
          <label for="inputPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="inputPassword" >
        </div>
  
        <button class="button" id="register_button">register</button>
      </form>
    `
    const registerBtn = document.getElementById('register_button')
  
    registerBtn.addEventListener('click', () => {
      event.preventDefault();
      registerUser();
    });
}

async function registerUser() {
	var username = document.getElementById("register_form")[0].value; // Get info from the register form
	var email = document.getElementById("register_form")[1].value;
	var password = document.getElementById("register_form")[2].value;
    let body = {
        'username': username,
        'mail': email,
        'password': password
    }
	console.log("Les infos du form:", body);

    try {
        const BASE_URL = 'http://localhost:8000'
        let endpoint = '/api/register';
        const response = await fetch(BASE_URL + endpoint, { // where we send data
            method: 'POST', // post = sending data
            headers: {
                'Content-Type': 'application/json', //data type we send
                // 'X-CSRFToken': csrftoken // cookie for django
            },
            body: JSON.stringify(body) // the data we send
        })

        if (response.ok) {
            console.log('User registered successfully', response);
        }
        else {
            console.error('Failed to register user:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

export { registerUser, displayRegisterForm } 

