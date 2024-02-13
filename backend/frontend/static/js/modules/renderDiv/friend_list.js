import { displayProfilPage } from "../display_page_function.js"

function put_friend_list_form_html() {
    var friend_list_div = document.getElementById("friend_list_div");
    friend_list_div.innerHTML = `
    <div class="card" id="friendListBody">                     
          <h5>Friends</h5>
          <div class="card-body d-flex flex-column" id="friendListCard"></div>
    </div>
    `;
    friend_list(); 
}

async function getFriendProfil(username) {
  try {
    displayProfilPage(`profil/${username}/`);
    const jwtToken = localStorage.getItem('jwt_token');
    const response = await fetch(`/api/profil/${username}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    
    const userData = await response.json();
    console.log(userData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur :', error);
  }
}

async function friend_list() {
  const friendListElement = document.getElementById('friendListCard');

  try {
    const response = await fetch('/api/my_friends');
    const data = await response.json();
    friendListElement.innerHTML = '';
    console.log(data);
    data.friend_list.forEach(friend => {
      var friendElement = document.createElement('div');
      friendElement.classList.add('card', 'text-center', 'mb-3');
      friendElement.style.backgroundColor = "#32353c";
      friendElement.style.borderColor = "#32353c";
      var color = '#ff0000';
      if (friend.user_is_in_game) {
        color = '#ff9900';
      }
      else if (friend.user_is_looking_game) {
        color = '#33ccff';
      }
      else if (friend.user_is_looking_tournament) {
        color = '#000066'
      }
      else if (friend.user_is_connected) {
        color = '#33cc33';
      }
      friendElement.innerHTML = `
        <div class="row">
          <div class="col">
            <span class="friend-status-dot" style="background-color: ${color}"></span>
            <button class="btn friend-button" >${friend.pseudo}</button>
          </div>
        </div>`;
      friendListElement.appendChild(friendElement);

      friendElement.querySelector('.friend-button').addEventListener('click', () => {
        const pseudo = friend.pseudo;
        console.log(`Clic sur le bouton de ${pseudo}`);
        getFriendProfil(pseudo);
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d\'amis :', error);
  }
}


export { put_friend_list_form_html };