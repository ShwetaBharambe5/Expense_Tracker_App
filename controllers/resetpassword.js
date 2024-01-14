const User = require('../models/user');

const UUID = require('uuid');

const SibApiV3Sdk = require('sib-api-v3-sdk');

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

dotenv.config();

const Forgotpassword = require('../models/forgotpassword');


const forgotPasswordForm = async (req, res) => {
    res.sendFile('forgotpassword.html', { root: 'public/views' });
}


const forgotPassword = async (req, res, next) => {

    try {
        let {email} = req.body;

        const user = await User.findOne({ where: { email: email } });

        if (user) {
            const id = UUID.v4();
            
            user.createForgotpassword({ id, active: true }).catch((err) => {
                throw new Error(err);
            });

            const client = SibApiV3Sdk.ApiClient.instance;
            // Configure API key authorization: api-key
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.SENDINBLUE_API_KEY

            const sender = {
                email: 'shwetabharambe21@gmail.com',
                name: 'Admin'
            }

            const receivers = [{
                email: email
            }]

            let tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi()

            tranEmailApi.sendTransacEmail({
                subject: "reset password email", sender,
                to: receivers,
                htmlContent: `<h1>click on the link below to reset the password</h1><br>
                    <a href="${process.env.WEBSITE}/password/resetpassword/${id}">Reset password</a>`,
            })
                .then((result) => {
                    console.log(result);
                    return res.status(202).json({
                        success: true,
                        message: "reset password link has been sent to your email",
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        else {
            throw new Error("User doesn't exist");
        }

    }

    catch (err) {
        console.log('err', err.message)
    }
}


const resetpassword = async(req, res) => {
    const id =  req.params.id;
    const forgetpassword=await Forgotpassword.findOne({ where : { id }});

        if(forgetpassword){
            await Forgotpassword.update({ active: false},{where:{id:forgetpassword.id}});
            res.status(200).send(`<html>
                                    <script>
                                        async function formsubmitted(e){
                                            e.preventDefault();
                                            const res=await axios.get('/password/updatepassword/${id}');
                                              
                                            console.log('res')
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label><br>
                                        <input name="newpassword" type="password" required></input><br>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()

        }
    
}

const updatepassword = async(req, res) => {

    try {
        const { newpassword } = req.query;

        const resetpasswordid = req.params.id;

        const resetpasswordrequest=await Forgotpassword.findOne({ where : { id: resetpasswordid }})
        
        const user=await User.findOne({where: { id : resetpasswordrequest.userId}})
                 //console.log('userDetails', user)
                if(user) {
                    //encrypt the password

                    let saltRound=10;
                  bcrypt.hash(newpassword,saltRound,async(err,hash)=>{
                    if(err){
                        console.log(err)
                        throw new Error(err)
                    }

                          await User.update({password:hash},{where:{id:user.id}})
                          console.log('password change successfully');
                          res.status(201).json({message: 'Successfuly update the new password'})
                  })
                    
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
        
        
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}

module.exports = {
    forgotPasswordForm,
    forgotPassword,
    updatepassword,
    resetpassword
}
