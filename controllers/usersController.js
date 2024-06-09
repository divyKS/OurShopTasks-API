const User = require('../models/User');
const Note = require('../models/Note');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// @route GET /users
const getAllUsers = expressAsyncHandler(async (req, res) => {
	const users = await User.find({}).select('-password -__v').lean();
	if (!users || users.length == 0) {
		// find returns an array of objects
		return res.status(400).json({ message: 'No users exist in the db' });
	}
	res.json(users);
});

// @route GET /users/:userID
const getUser = expressAsyncHandler(async (req, res) => {
    const { userID } = req.params;
    if (!userID) {
        return res.status(400).json({ message: "userID missing to fetch user data" });
    }
    if(!mongoose.isValidObjectId(userID)){
        return res.status(400).json({ message: "userID is not a valid mongoose object id" });
    }
    const userData = await User.findById(userID).lean();
    if (!userData) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(userData);
});

// @route POST /users
const createNewUser = expressAsyncHandler(async (req, res) => {
	const { username, password, roles } = req.body;
	if ( !username || !password || Array.isArray(roles) == false || roles.length == 0 ) {
		return res.status(400).json({ message: 'All fields are needed!' });
	}

	const duplicateUser = await User.findOne({ username: username }).lean().exec();

	if (duplicateUser) {
		return res.status(409).json({ message: 'This username is already taken.' });
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await User.create({ username, password: hashedPassword, roles });
	// const newUser = new User({username, password, roles}); // object
	// await newUser.save();

	if (newUser) {
		return res.status(201).json({ message: `User ${username} created successfully.` });
	} else {
		res.status(400).json({ message: 'User data does not meet validation rules of the designed schema/something might be null' });
	}
});

// @route PATCH /users
const updateUser = expressAsyncHandler(async (req, res) => {
	const { id, username:newName, roles:newRoles, active:newActive, password } = req.body
    
    if( !id || !newName || !Array.isArray(newRoles) || typeof newActive !== 'boolean' ){
        return res.status(400).json({ message: "All fields except password are required" });
    }

    const userToUpdate = await User.findById(id).exec();

    if(!userToUpdate){
        return res.status(400).json({ message: "User with given id does not exist" });
    }

    // can the newName be assigned?
    const duplicateUser = await User.findOne({ username: newName}).lean().exec();


    if(duplicateUser && duplicateUser?._id.toString() !== id){
        return res.status(400).json({ message: "The new username is already taken." });
    }

    userToUpdate.username = newName;
    userToUpdate.roles = newRoles;
    userToUpdate.active = newActive;

    if(password){
        console.log("updating password");
        const newHashedPassword = await bcrypt.hash(password, 10);
        userToUpdate.password = newHashedPassword;
    }

    await userToUpdate.save();

    res.json({ message: `User has been updated to ${userToUpdate.username}` });
});

// @route DELETE /users
const deleteUser = expressAsyncHandler(async (req, res) => {
	const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "User ID missing" });
    }
    if(!mongoose.isValidObjectId(id)){
        return res.status(400).json({ message: "User ID is not a valid mongoose object id" });
    }
    
    const userToBeDeleted = await User.findById(id).exec();

    if(!userToBeDeleted){
        return res.status(400).json({ message: "User with given ID not found." });
    }

    const notes = await Note.find({ user: id }).lean().exec();

    if(notes.length){
        const allTasksAreCompleted = notes.reduce((acc, note)=>{
            acc = acc && note.completed
            return acc;
        }, true);
        if(!allTasksAreCompleted){
            return res.status(400).json({ message: "User has notes assigned. Delete the notes before deleting the user." });
        }
    }

    await userToBeDeleted.deleteOne();

    res.json({ message: `User with username ${userToBeDeleted.username} and ${id} ID has been deleted` });
});

module.exports = { getAllUsers, getUser, createNewUser, updateUser, deleteUser };
