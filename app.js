//Starting of app.js file

const express = require('express');

const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./util/database');

const User = require('./models/user');

const Expense = require('./models/expense');

const Order = require('./models/order');

const ForgetPassword = require('./models/forgotpassword');


const userRoutes = require('./routes/expense');

const signupRoute = require('./routes/user');

const loginRoute = require('./routes/login');

const perchaseRoute = require('./routes/purchase');

const premiumRoute = require('./routes/premiumFeature');

const forgotpasswordRoute = require('./routes/forgotpassword');



const port = process.env.PORT;

const app = express();


app.use(express.json());

app.use(express.static('public'))


app.use(signupRoute);

app.use(loginRoute);

app.use(userRoutes);

app.use(perchaseRoute);

app.use(premiumRoute);

app.use(forgotpasswordRoute);


//app.use(express.static(path.join(__dirname,'views')));

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgetPassword);
ForgetPassword.belongsTo(User);

sequelize.sync({force:false})
    .then(()=> {
        app.listen(port, ()=>{
            console.log(`Server is running on ${port}`);
        });
    })
    .catch(err => console.log(err));
