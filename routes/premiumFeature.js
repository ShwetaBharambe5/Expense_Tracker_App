const express=require('express');
const premiumController=require('../controllers/premiumFeature')
const userAuthenticate=require('../middleware/auth')


const router=express.Router();

router.get('/premium/showLeaderBoard',userAuthenticate.authenticate,premiumController.getUserLeaderBoard);


module.exports=router;