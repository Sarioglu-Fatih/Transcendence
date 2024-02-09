import { displayAvatar } from "../profilPage.js";
import { makeApiRequest } from "../utils.js";
import { displayProfilPage } from "../display_page_function.js";

function put_top_box_form_html() {
    var top_box_div = document.getElementById("top_box_div");
    top_box_div.innerHTML = `  
    <div class="card" id="top_box">
        <div class="card-body d-flex flex-column justify-content-between" style="width:100vw;">
            <div class="row">
              <div class="col-md-4">
                <div class="img img-fluid" id="avatar">
                  <a id="homelink" href="#"  ><img id="avatar-image" class="avatar-image" src="" alt="user-avatar"></a>
                </div>
              </div>
              <div class="col-md-4">
                <button class="btn btn-primary " id="profil_button">profil</button>
              </div>
              <div class="col-md-4">
                <button class="btn btn-primary" id="logout_button">logout</button>
              </div>
            </div>
        </div>
    </div>
    `;

    const logoutBtn = document.getElementById('logout_button');
    logoutBtn.addEventListener('click', () => {
        document.getElementById('emailError').innerHTML = '';
        document.getElementById('usernameError').innerHTML = '';
        localStorage.removeItem('jwt_token');
        displayLoginPage();
        logout();
    });

    const profilBtn = document.getElementById('profil_button');
    profilBtn.addEventListener('click', async () => {
        const response = await makeApiRequest("username");
        const data = await response.json()
        displayProfilPage("/profil/" + data.username);
    });

    displayAvatar()
    
    const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    const homePageURL = '/home';
    const fullHomePageURL = baseURL + homePageURL;
    const homelink = document.getElementById('homelink');
    homelink.href = fullHomePageURL;
    
}

export { put_top_box_form_html };