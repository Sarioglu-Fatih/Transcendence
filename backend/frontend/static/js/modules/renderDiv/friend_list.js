function put_friend_list_form_html() {
    var friend_list_div = document.getElementById("friend_list_div");
    friend_list_div.innerHTML = `  
    <div class="card" id="friendListBody">                     
          <h3>My friends :<p></br></p></h3>
          <div class="card-body" id="friendListCard"></div>
    </div>
    `;
    friend_list(); 
}

async function friend_list() {
    const friendListElement = document.getElementById('friendListCard');
  
    try {
      const response = await fetch('/api/my_friends');
      const data = await response.json();
      console.log(data.friend_list);
      friendListElement.innerHTML = '';
      data.friend_list.forEach(friend => {
        console.log(friend.username);
        var friendElement = document.createElement('div');
        friendElement.classList.add('card', 'text-center', 'mb-3')
        friendElement.innerHTML = `
          <div class="row">
            <div class="col">
              <button class="btn friend-button">${friend.username}</button>
            </div>
          </div>`;
        friendListElement.appendChild(friendElement);
  
        friendElement.querySelector('.friend-button').addEventListener('click', () => {
          const username = friend.username;
          console.log(`Clic sur le bouton de ${username}`);
          getFriendProfil(username);
        });
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste d\'amis :', error);
    }
}

export { put_friend_list_form_html };