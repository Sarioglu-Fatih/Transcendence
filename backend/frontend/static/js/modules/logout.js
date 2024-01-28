async function logout() {
    try {
      const response = await fetch('http://localhost:8000/api/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
  
      if (response.ok) {
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