const User = require('../models/User');
const Note = require('../models/Note');
const expressAsyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @route GET /notes
const getAllNotes = expressAsyncHandler(async (req, res) => {
    const notes = await Note.find({ }).lean();
    if(!notes?.length){
        return res.status(200).json({message: "There are no notes"});
    }
    const notesWithUsernames = await Promise.all(
        notes.map(async (note) => {
            const user = await User.findById(note.user).lean().exec();
            return { ...note, username: user.username };
        })
    );
    // const notesWithUsernames = []
    // for(const note of notes){
    //     const user  = await User.findById(note.user).lean().exec();
    //     notesWithUsernames.push({ ...note, username: user.username });
    // }

    const sortedNotesWithUser = notesWithUsernames.sort((a, b) => {
        if (a.completed === b.completed) { // both true or both false
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a.completed ? 1 : -1;
        // -1 means put this before b
    });

    res.json(sortedNotesWithUser);
});


const getNote = expressAsyncHandler( async (req, res) => {
    const { noteID } = req.params;
    if (!noteID) {
        return res.status(400).json({ message: "noteID missing to fetch note data" });
    }
    if(!mongoose.isValidObjectId(noteID)){
        return res.status(400).json({ message: "noteID is not a valid mongoose object id" });
    }
    const noteData = await Note.findById(noteID).lean();
    if (!noteData) {
        return res.status(404).json({ message: "Note not found" });
    }
    res.json(noteData);
});


// @route POST /notes
const createNewNote = expressAsyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    if ( !user?.length || !title?.length || !text?.length ){
        return res.status(400).json({ message: 'All fields are required' });
    }

    const duplicateNote = await Note.find({ "title": title }).lean().exec();

    if(duplicateNote.length){
        return res.status(409).json({ message: 'Duplicate note title' });
    }

    const newNote = await Note.create({title, user, text});

    if(newNote){
        return res.status(201).json({ message: 'New note created' });
    }
    else{
        return res.status(400).json({ message: 'Invalid note data received' });
    }
});


// @route PATCH /notes
const updateNote = expressAsyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const note = await Note.findById(id).exec();
    if (!note) {
        return res.status(400).json({ message: 'Note not found' });
    }
    const duplicate = await Note.findOne({ title }).lean().exec();

    // if we want to update to same title, let it update
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' });
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json({message: `${updatedNote.title} updated`});
});


// @route DELETE /notes
const deleteNote = expressAsyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Note ID required or not valid' });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
        return res.status(400).json({ message: 'Note not found' });
    }

    const result = await note.deleteOne();
    // console.log(result); { acknowledged: true, deletedCount: 1 }

    res.json({message: `Note ${note.title} with ID ${note._id} deleted`});
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote, getNote };