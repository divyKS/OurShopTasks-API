const mongoose = require('mongoose');

const connectToDB = async() => {
    try{
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connection to DB established (from config.js)');
    }
    catch(err){
        console.log('Could not connect to DB', err);
    }
};

module.exports = connectToDB;