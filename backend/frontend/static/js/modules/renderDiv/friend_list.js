import { displayProfilPage } from "../display_page_function.js"

function put_friend_list_form_html() {
    var friend_list_div = document.getElementById("friend_list_div");
    friend_list_div.innerHTML = `
    <div class="card" id="friendListBody">                     
          <h5>Friends</h5>
          <div class="card-body d-flex flex-column" id="friendListCard"></div>
          <div class="card-footer" id="friend_footer">
            <div class="row">
                <div class="col-md-6 d-flex justify-content-center align-items-center">
                    <button id="load_less" class="btn btn-primary mt-3">Previous</button>
                </div>
                <div class="col-md-6 d-flex justify-content-center align-items-center">
                    <button id="load_more" class="btn btn-primary mt-3">Next</button>
                </div>
            </div>
        </div>
    </div>
    `;
    friend_list(); 
}

async function getFriendProfil(username) {
  try {
    history.pushState({}, '', `/profil/${username}/`);
    displayProfilPage();
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur :', error);
  }
}

async function friend_list() {
  const friendListElement = document.getElementById('friendListCard');
  const loadLessButton = document.getElementById('load_less');
  const loadMoreButton = document.getElementById('load_more');
  var offset = 0;
  try {
    const response = await fetch('/api/my_friends/');
    const data = await response.json();
    
    const loadTwentyFriends = () => {
      friendListElement.innerHTML = '';
      const nextFriends = data.friend_list.slice(offset, offset + 17);
      if(nextFriends.length > 0){
        nextFriends.forEach(friend => {
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
            getFriendProfil(pseudo);
          });
        });
      }
    }
    loadMoreButton.addEventListener('click', async () => {
      const nextFriends = data.friend_list.slice(offset, offset + 17);
      if (nextFriends.length > 16)
          offset += 17;
          loadTwentyFriends();
    });

    loadLessButton.addEventListener('click', () => {
        if (offset >= 17)
            offset -= 17;
            loadTwentyFriends();
    });

    // Initial load of matches
    loadTwentyFriends();
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d\'amis :', error);
  }
}


export { put_friend_list_form_html, getFriendProfil };