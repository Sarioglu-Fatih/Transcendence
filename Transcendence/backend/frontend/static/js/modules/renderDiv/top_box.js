import { displayAvatar } from "../profilPage.js";
import { makeApiRequest } from "../utils.js";
import { displayProfilPage, displayLoginPage, displayHomePage } from "../display_page_function.js";
import { logout } from "../logout.js";
import { isUserLoggedIn } from "../../main.js";

function put_top_box_form_html() {
    var top_box_div = document.getElementById("top_box_div");
    top_box_div.innerHTML = `  
    <div class="card" id="top_box">
        <div class="card-body d-flex flex-column justify-content-center">
            <div class="row justify-content-center">
              <div class="col-md-4 col-sm-3">
                <div class="img img-fluid" id="avatar">
                  <img id="avatar-image" class="avatar-image" src="" alt="user-avatar">
                </div>
              </div>
              <div class="col-md-4 d-flex col-sm-3 justify-content-center align-items-center">
               <button class="btn btn-primary " id="profil_button">Profil</button>
              </div>
              <div class="col-md-4  d-flex col-sm-3 justify-content-end align-items-center">
                <button class="btn btn-primary" id="logout_button">Logout</button>
              </div>
            </div>
        </div>
    </div>
    `;

    const logoutBtn = document.getElementById('logout_button');
    logoutBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        await logout();
        displayLoginPage();
    });

    const profilBtn = document.getElementById('profil_button');
    profilBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const response = await makeApiRequest("username");
      const data = await response.json()
      const path = window.location.pathname;
      if (path === `/profil/${data.username}/`){
        return;
      }
      history.pushState({}, '', `/profil/${data.username}`);
      displayProfilPage();
    });

    if (isUserLoggedIn()){
      displayAvatar();
    }
    const avatar_image = document.getElementById('avatar-image');
    avatar_image.addEventListener('click', (event) => {
      event.preventDefault();
      const path = window.location.pathname;
      if (path === `/home`){
        return;
      }
      history.pushState({}, '', '/home');
      displayHomePage();
    })
}

export { put_top_box_form_html };