const express = require('express')
const userRouter = require('../controllers/userController')


const router=express.Router();

router.use('/user',userRouter);

module.exports = router; 