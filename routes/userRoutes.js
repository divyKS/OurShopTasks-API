const express = require('express');
const router = express.Router();
const { getAllUsers, createNewUser, updateUser, deleteUser, getUser } = require('../controllers/usersController');

router.get('/', getAllUsers);
router.get('/:userID', getUser);
router.post('/', createNewUser);
router.patch('/', updateUser);
router.delete('/', deleteUser);


// router.route('/')
//     .get()
//     .post()
//     .patch()
//     .delete()

module.exports = router;