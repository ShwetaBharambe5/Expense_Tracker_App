const express = require('express');


const resetpasswordController = require('../controllers/resetpassword');
const router = express.Router();

router.get('/password/forgotpassword',resetpasswordController.forgotPasswordForm);
router.post('/password/forgotpassword', resetpasswordController.forgotPassword);
router.get('/password/updatepassword/:id', resetpasswordController.updatepassword);
router.get('/password/resetpassword/:id', resetpasswordController.resetpassword);

module.exports = router;