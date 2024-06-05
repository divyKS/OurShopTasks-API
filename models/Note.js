const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 900
});

// {
//     "_id": {
//       "$oid": "6612a7424bcda2176179ebff"
//     },
//     "user": {
//       "$oid": "660267464dcc00c64a34cd4d"
//     },
//     "title": "JS Promises",
//     "text": "That's a lot, GPT helped me understand that today, and as always kartik did too",
//     "completed": false,
//     "createdAt": {
//       "$date": "2024-04-07T14:01:38.049Z"
//     },
//     "updatedAt": {
//       "$date": "2024-04-07T14:01:38.049Z"
//     },
//     "ticket": 900,
//     "__v": 0
// }

module.exports = mongoose.model('Note', noteSchema)