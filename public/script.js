const expenseForm = document.querySelector('#expenseForm');
const expenseAmount = document.querySelector('#expenseAmount');
const expenseDescription = document.querySelector('#expenseDescription');
const expenseCategory = document.querySelector('#expenseCategory');
const expenseList = document.querySelector('#expenses');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get("/get-expense",{headers:{"Authorization":token}});

    const decodetoken= parseJwt(token)

    const page = 1;

    if(decodetoken.ispremiumuser){
        showPremiumusermessage();
        showleaderBoard();
    }

    // for(let i=0; i<response.data.expense.length; i++)
    //   showUsersOnScreen(response.data.expense[i]);
      listExpense(response.data.allExpenses);

      showPagination(response.data);
  }
  catch (err) {
    console.log(err);
  }
});


async function listExpense(data){
  try {

      const parentNode=document.getElementById('allExpenselist');
      ///clear the existing expense 
      parentNode.innerHTML='';

      for(i in data){
        showUsersOnScreen(data[i]);
      }
      
  } catch (error) {
      console.log('error in list expense in frontend ', error);
  }
}


expenseForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  const expenseDetails = {
    amount: expenseAmount.value,
    description: expenseDescription.value,
    category: expenseCategory.value,
  };

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post("/add-expense", expenseDetails, {headers:{"Authorization":token}});
    console.log('expense details created successfully:', response.data);

    showUsersOnScreen(response.data.newExpenseDetails);
    clearInputs();

  } catch (err) {
    console.log('Error creating expense:', err);
  }

}


function showUsersOnScreen(expense) {
  const parentNode=document.getElementById('expenses');

    const childNode= `<li id="${expense.id}">${expense.amount}--${expense.description}--${expense.category}
    <button class="btn btn-danger" onclick="deleteUserExpense(${expense.id})">DeleteExpense</button></li>`

    parentNode.innerHTML+=childNode;
}

async function deleteUserExpense(id) {
  try {
    const token=localStorage.getItem('token');
    const res=await axios.delete(`/delete-expense/${id}`,{headers:{"Authorization":token}});
    removeUserFromScreen(id);
    
} catch (error) {
    console.log(error);
    document.body.innerHTML+=`<h4>Something went wrong --${error}</h4>`
}
}

function removeUserFromScreen(id)
{
    const parentNode=document.getElementById('expenses');

    const childNode=document.getElementById(id);

    parentNode.removeChild(childNode);

}

function clearInputs() {
  expenseAmount.value = '';
  expenseDescription.value = '';
  expenseCategory.value = '';
}

document.getElementById('rzp-button').onclick = async function (e) {
  const token=localStorage.getItem('token');
  const response = await axios.get('/purchase/premiummembership', {headers:{"Authorization":token}});

  var options = 
  {
    "key":response.data.key_id,
    "order_id":response.data.order.id,
    "handler":async function(response){
      const res = await axios.post('/purchase/updatetransactionstatus', {
        order_id:options.order_id,
        payment_id:response.razorpay_payment_id
      }, {headers:{"Authorization":token}});
    
      localStorage.setItem('token',res.data.token);

      alert('You are a premium user now');
      showPremiumusermessage();
      showleaderBoard();
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function(response){
    console.log(response)
    alert('Something went wrong');
  });
}

function showPremiumusermessage()
{
    const rzp=document.getElementById('rzp-button').style.display="none";
    //visibility hidden takes space display none takes no space
    document.getElementById('premium').innerHTML+="You are now a Premium User"
   
}

function showleaderBoard()
{
    const inputElement=document.createElement('input');
    inputElement.type='button';
    inputElement.value='Show Leaderboard';
    inputElement.style.backgroundColor='gold';
    inputElement.style.color='black';
    inputElement.style.borderRadius='15px';
    inputElement.style.padding='8px';


    inputElement.onclick=async()=>{
      const token=localStorage.getItem('token');
      const userLeaderboardArray=await axios.get('/premium/showLeaderBoard',{headers:{"Authorization":token}});


      let leaderboardElement=document.getElementById('leaderboard');
      leaderboardElement.innerHTML='<h4>LeaderBoard</h4>';
      const data=userLeaderboardArray.data.userLeaderBoardDetails;
      
      data.forEach((user)=>{
        leaderboardElement.innerHTML+=`<li>Name:${user.name} TotalExpense:${user.totalExpenses}`
      })

}

document.getElementById('premium').appendChild(inputElement);

}

function download(){
  const token=localStorage.getItem('token');
  axios.get('/user/download', { headers: {"Authorization" : token} })
  .then((response) => {
      if(response.status === 200){
          //the bcakend is essentially sending a download link
          //  which if we open in browser, the file would download
          var a = document.createElement("a");
          a.href = response.data.fileURL;
          a.download = 'myExpense.txt';
          a.click();
      } else {
          throw new Error(response.data.message)
      }

  })
  .catch((err) => {
      console.log(err)
  });
}


async function pageSize(val){
  try {
      const token = localStorage.getItem('token');
      localStorage.setItem('pageSize',val);
      const page=1
      const res = await axios.get(`/get-expense?page=${page}&pageSize=${val}`,{headers:{"Authorization":token}});
      
      listExpense(res.data.allExpenses)
      showPagination(res.data);
  } catch (error) {
      console.log(error);
  }
}


async function showPagination({currentPage,hasNextPage,nextPage,hasPreviousPage,previousPage,lastPage}){
  try{
      const pagination = document.getElementById('pagination');
      pagination.innerHTML = ''
      if(hasPreviousPage){
          const btn2 = document.createElement('button')
          btn2.innerHTML = previousPage
          btn2.addEventListener('click', ()=>getProducts(previousPage))
          pagination.appendChild(btn2)
      }
      const btn1 = document.createElement('button')
      btn1.innerHTML = currentPage
      btn1.addEventListener('click',()=>getProducts(currentPage))
      pagination.appendChild(btn1)

      if (hasNextPage){
          const btn3 = document.createElement('button')
          btn3.innerHTML = nextPage
          btn3.addEventListener('click',()=>getProducts(nextPage))
          pagination.appendChild(btn3)

      }
      if (currentPage!==1){
          const btn4 = document.createElement('button')
          btn4.innerHTML = 'main-page'
          btn4.addEventListener('click',()=>getProducts(1))
          pagination.appendChild(btn4)

      }

  }
  catch(err){
      console.log(err)
  }
}


async function getProducts(page){
  try {
      const token = localStorage.getItem('token');
      const pageSize = localStorage.getItem('pageSize')
  
      const res = await axios.get(`/get-expense?page=${page}&pageSize=${pageSize}`,{headers:{"Authorization":token}});
      
      listExpense(res.data.allExpenses)
      showPagination(res.data);
  } catch (error) {
      console.log(error);
  }
}
