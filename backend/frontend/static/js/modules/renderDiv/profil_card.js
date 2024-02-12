import { error404, showDivs } from "../display_page_function.js"
import { hideDivs, makeApiRequest } from "../utils.js";
import { updateUser } from "../register.js";
import { enable2fa, disable2fa, check2faStatus} from "../two_fa.js";
import { isFriend, handleAvatarUpload} from "../profilPage.js";
import { displayProfilPage } from "../display_page_function.js";


async function put_profil_card_html() {
    var profil_card_div = document.getElementById("profil_card_div");
    profil_card_div.innerHTML = `  
    <div class="card" >                     
        <div class="card-body"  id="profile_settings_card">
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">2FA</button>
        <div style="min-height: 120px;">
        <div class="collapse collapse-horizontal" id="collapseWidthExample">
            <div class="card card-body" style="width: 300px;">
            <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="switchbox2FA">
            <label class="form-check-label" for="switchbox2FA">Enable 2FA</label>
            </div>
            <div id="qrcode"></div>
            </div>
        </div>
        </div>
        <div class="cardtext-center col-md-6 text-center">
        </div>
    <div id="2FA_button">
    </div>
    <form id="update_form" class="update_form">
                <div class="d-flex justify-content-center">
                    <button class="btn btn-primary" id="addFriend_button">Add friend</button>
                </div>
                <div class="row">
                    <div class="col-md-6 text-center" id="profilLeftSide">
                        <div class="element" id="username_key"></div>
                        <div class="element" id="pseudo_key"></div>
                        <div class="element" id="email_key"></div>
                        <div class="element" id="win_lose_key"></div>
                    </div>
                    <div class="col-md-4 element text-center" id="profilRightSide">
                        <label for="inputUsername" class="form-label"></label>
                        <input type="text" class="form-control" id="updateUsername" placeholder="Username" maxlength="16">
                        <span id="updateUsernameError" class="error-message"></span>

                        
                        <label for="inputEmail" class="form-label element"></label>
                        <input type="email" class="form-control" id="updateEmail" placeholder="yourmail@random.com" maxlength="50">
                        <span id="updateEmailError" class="error-message"></span>
                        
                        <label for="inputPassword" class="form-label element"></label>
                        <input type="password" class="form-control" id="updatePassword" placeholder="Password" maxlength="16">
                        <span id="updatePasswordError" class="error-message"></span>
                
                        <div class="card-footer text-center element">
                            <button class="btn btn-primary" id="save_button">Save Change</button>
                        </div>
                    </div>
                </div>
     </form>
            <form id="avatar_upload_form" enctype="multipart/form-data" > 
                <label for="id_avatar">Choose an avatar:</label>
                <input type="file" id="id_avatar" name="avatar" accept="image/*" class="form-control" aria-label="file example" required/>
                <button type="button" class="btn btn-primary" id="upload_avatar_button" onclick="uploadAvatar()">Upload Avatar</button>
            </form>
            </div>
        </div>
        </div>
        <figure>
        <blockquote class="blockquote">
            <p>This website is the most ergonomic that I have seen in my entire life, period.</p>
        </blockquote>
        <figcaption class="blockquote-footer">
            Bill Gates in <cite title="Source evian mon reuf">The Washington Post</cite>
        </figcaption>
        </figure>
    </div>
    `;
    await check_whos_profil();
    const updateForm = document.getElementById('update_form');
        updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        updateFormParse();
    });
    // Switchbox for enable 2FA
    var switchbox2FA = document.getElementById('switchbox2FA');
    switchbox2FA = await check2faStatus();
    switchbox2FA.addEventListener('change', async (event) => {
        event.preventDefault();
        if (switchbox2FA.checked) {
            enable2fa();
            console.log('2FA is enabled');
        }
        else {
            disable2fa();
            console.log('2FA is disabled');
        }
    });

    const addFriend = document.getElementById('addFriend_button');
    addFriend.addEventListener('click', async function (event) {
        event.preventDefault();

        const clientURL = window.location.href;
        const segments = clientURL.split('/');
        let lastSegment = segments[segments.length - 2];
        lastSegment += "/";
        const response = makeApiRequest(`add_friend/${lastSegment}`)
        displayProfilPage(window.location.pathname);
    })

    window.uploadAvatar = async function () {
        handleAvatarUpload()
    }

}

async function check_whos_profil() {
    try {
        let isHimself = await renderProfilPage();
        let is42u = await is42user();
        if (isHimself == true) {
            hideDivs(["addFriend_button"]);
            if (is42u)
                hideDivs(["profilRightSide"]);

            
        }
        else {
            const currentPath = window.location.pathname.substring(1);
            const userToAddName = currentPath.replace(/^profil/, 'isFriend');

            const isFriends = await isFriend(userToAddName);
            console.log(isFriends);
            if (isFriends){
                hideDivs(["profilRightSide", "addFriend_button", "2FA_button", "avatar_upload_form"]);
                showDivs(["profilLeftSide"]);
            }
            else {
                hideDivs(["profilRightSide", "2FA_button", "avatar_upload_form"]);
                showDivs(["profilLeftSide", "addFriend_button"]);
            }
        }
    }
    catch (error) {
        if (error.status === 400) {
            hideDivs(["profilRightSide"])
            showDivs(["profilLeftSide", "addFriend_button"]) 
        }
        else {
            throw new Error('Not a profil');
        }
    }
}

async function is42user() {
    const currentPath = window.location.pathname.substring(1) ;
    const response = await makeApiRequest(currentPath)
    if (!response.ok)
    {
        console.log("not ok");
        throw new Error('Not a profil');
    }
    let userData = await response.json()
    const user = userData.username;
    if(!user)
        return false;
    if (user.substring(user.length - 3) == "@42")
        return true;
    return false;
}

async function renderProfilPage() {
    try {
        let isHimself = false;
        const currentPath = window.location.pathname.substring(1) ;
        const response = await makeApiRequest(currentPath)
        if (!response.ok){
            console.log("not ok");
            throw new Error('Not a profil');
        }
        const userData = await response.json()
        var username_type = document.getElementById('username_key');
        var pseudo_type = document.getElementById('pseudo_key');
        var email_type = document.getElementById('email_key');
        var resulte_type = document.getElementById('win_lose_key');

        let win_string = userData.win.toString();
        let lose_string = userData.lose.toString();

        if (userData.username){
            username_type.textContent = "username : ";
            username_type.textContent += userData.username;
        }
        else
            username_type.textContent = '';

        pseudo_type.textContent = "pseudo   : ";
        pseudo_type.textContent += userData.pseudo;

        if (userData.email){
            email_type.textContent = "email     : ";
            email_type.textContent += userData.email;
            isHimself = true;
        }
        else
            email_type.textContent = "";

        resulte_type.textContent = "win  ";
        resulte_type.textContent += win_string;
        resulte_type.textContent += " : ";
        resulte_type.textContent += lose_string;
        resulte_type.textContent += "  lose";
        return (isHimself);
    }
    catch (err) {
        throw new Error('Not a profil');
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
      let updateValue = await updateUser();
      if (updateValue == "error")
        return ;
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

function removeCharactersAfterLastSlash(str) {
    const lastSlashIndex = str.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
        return str.substring(0, lastSlashIndex + 1);
    } else {
        return str;
    }
}


export { put_profil_card_html,  renderProfilPage};