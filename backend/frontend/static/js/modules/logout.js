import { hideDivs, showDivs } from "./utils.js";

async function logout() {
    try {
      const response = await fetch('https://localhost:8000/api/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
  
      if (response.ok) {
        document.getElementById('emailError').innerHTML = '';
        document.getElementById('usernameError').innerHTML = '';
        history.pushState({}, '', '/login');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        hideDivs(['top_box',  'game_launcher', 'friend_list', 'profil_page']);
        showDivs(['div_register_form', 'div_login_form']);
        console.log('Logout successful.');
      }
      else {
        console.error('Error logout:', response.status);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }

export { logout }