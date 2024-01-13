const User = require('../models/user');

const signupRoute = require('../routes/user');

const path = require('path');

const bcrypt = require('bcrypt');

function isStringInvalid(string){
    if(string==undefined || string.length==0)
        return true;
    return false;
}

const getUserForm = async(req, res) => {
    res.sendFile('signup.html', { root: 'public/views' });
}

const addUser = async(req, res, next) => {
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if(isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password))
            return res.status(400).json({err:'Bad Parameter, Something is missing'});

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            
            if(err)
            {
                console.log(err);
            }
                
            await User.create({name:name, email:email, password:hash});

            res.status(201).json({message:'Successfully created new user'});
        })
        
    }catch(err){
        res.status(500).json({error:err});
    }
}

module.exports = {
    getUserForm,
    addUser
}