// login.js

function validateAndRedirect(event) {
    event.preventDefault(); // Stop the link from navigating immediately
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }
  
    // Redirect only if validation passes
    window.location.href = '/index.html';
  }
  