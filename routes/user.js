const express = require('express');

const router = express.Router();

const signupController = require('../controllers/user');

router.post('/signup', signupController.addUser);
router.get('/', signupController.getUserForm);

module.exports = router;