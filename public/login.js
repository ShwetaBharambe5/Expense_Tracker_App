const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');

  const userDetails = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  try {
    // Send a POST request to your server for login validation
    const response = await axios.post("/login", userDetails);

    // Assuming your server returns a response indicating success or failure
    if (response.data.success) {
      alert('Login successful!');

      localStorage.setItem('token',response.data.token);

      // Redirect to another page or perform any other actions upon successful login
      window.location.href = "/home";
    } else {
      alert('Login failed. Please check your email and password.');
    }
  } catch (err) {
    console.error('Error during login:', err);
  }
}
