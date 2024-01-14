const { rejects } = require('assert');
const Expense = require('../models/expense');

const User = require('../models/user');

const userRoute = require('../routes/expense');

const sequelize = require('../util/database');

const UserServices = require('../services/userservices');

const S3services = require('../services/S3services');

const path = require('path');

const getExpenseForm = async (req, res) => {
    res.sendFile('index.html', { root: 'public/views' });
}


const downloadExpense = async (req, res, next) => {
    try {
        const expenses = await UserServices.getExpenses(req);
       
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user.id;

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename);
        res.status(200).json({ fileURL, success: true, err: null });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ fileURL: '', success: false, err: err })
    }
}

const addExpense = async (req, res, next) => {
    try {
        const t = await sequelize.transaction();

        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;

        const data = await Expense.create({ amount: amount, description: description, category: category, userId: req.user.id }, { transaction: t });


        totalExpense = Number(req.user.totalExpenses) + Number(amount);

        await User.update({ totalExpenses: totalExpense }, { where: { id: req.user.id }, transaction: t });

        await t.commit();

        res.status(201).json({ newExpenseDetails: data });

    } catch (err) {
        await t.rollback();

        res.status(500).json({ error: err });
    }
}

const deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {

        const expenseId = req.params.id;

        const expense = await Expense.findByPk(expenseId);

        const totalExpense = Number(req.user.totalExpenses) - Number(expense.amount);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found!' });
        }


        const numOfrows = await Expense.destroy({ where: { id: expenseId, userId: req.user.id }, transaction: t });

        if (numOfrows === 0) {
            return res.status(404).json({ success: false, message: 'Expense does not belong to the user' });
        }


        await User.update({ totalExpenses: totalExpense }, { where: { id: req.user.id }, transaction: t })

        await t.commit();

        res.status(200).json({ message: 'Expense deleted successfully' });
    }
    catch (err) {
        await t.rollback();
        console.log('Error deleting expense:', err);
        res.status(500).json({ error: err });
    }
};

const getExpenses = async (req, res, next) => {
    try {
        
        const check = req.user.ispremiumuser;
        const page = +req.query.page||1;
        const pageSize = +req.query.pageSize||10;
        const totalExpenses = await req.user.countExpenses();

        const data=await req.user.getExpenses({
               offset:(page-1)*pageSize,
               limit: pageSize,
               order:[['id','DESC']]
        })

        res.status(200).json({
           allExpenses: data,
           check,
           currentPage: page,
           hasNextPage: pageSize * page < totalExpenses,
           nextPage: page + 1,
           hasPreviousPage: page > 1,
           previousPage: page - 1,
           lastPage: Math.ceil(totalExpenses / pageSize) 
        })

    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: err });
    }
}


module.exports = {
    getExpenseForm,
    addExpense,
    deleteExpense,
    getExpenses,
    downloadExpense
}