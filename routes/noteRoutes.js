const express = require('express');
const router = express.Router();
const { getAllNotes, createNewNote, updateNote, deleteNote, getNote } = require('../controllers/notesController');

router.get('/', getAllNotes);
router.get('/:noteID', getNote);
router.post('/', createNewNote);
router.patch('/', updateNote);
router.delete('/', deleteNote);

module.exports = router;