const loginForm = document.querySelector('#form');

form.addEventListener('submit', forgetPassword);


async function forgetPassword(event)
{
   try {
      const messageElement = document.getElementById('message');
      
      event.preventDefault();
      
      const data={
        email:document.getElementById('mailid').value
      }
      
      console.log(data);

      const res = await axios.post('/password/forgotpassword',data);

      document.getElementById('mailid').value=''
      if (res.status === 202){
        messageElement.textContent='Mail Send Successfully'
      }
      else{
        alert('Email id Wrong Check Once again!')
        messageElement.textContent='Mail Send Unsuccessfully '
     }  

   } catch (error) {
      console.log(error);
   
      document.body.innerHTML+=`<h4>Something went wrong --${error}</h4>`
    
   }

}