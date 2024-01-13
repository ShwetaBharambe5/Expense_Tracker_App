const express = require('express');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

const userController = require('../controllers/expense');

router.post('/add-expense', userAuthentication.authenticate, userController.addExpense);
router.delete('/delete-expense/:id', userAuthentication.authenticate, userController.deleteExpense);
router.get('/get-expense', userAuthentication.authenticate, userController.getExpenses);
//router.get('/expense/getexpenses',userAuthentication.authenticate,userController.getExpenses);
router.get('/home', userController.getExpenseForm);
router.get('/user/download',userAuthentication.authenticate,userController.downloadExpense);

module.exports = router;