const signupForm = document.querySelector('#signupForm');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

signupForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  const userDetails = {
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  };

  try {
    const response = await axios.post("/signup", userDetails);
    console.log('User created successfully:', response.data);
    
    if (response.status === 201) {
        // User created successfully, redirect to login page
        console.log('Redirecting to login page...');
        window.location.href = "/login";
      } else {
        // Handle other status codes if needed
        console.log('Error creating user. Status Code:', response.status);
      }

    clearInputs();
  } catch (err) {
    console.log('Error creating user:', err);
    document.body.innerHTML+= `<div style="colour:red;">${err}</div>`;
  }
}

function clearInputs() {
  nameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
}
