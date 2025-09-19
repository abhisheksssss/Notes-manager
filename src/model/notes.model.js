import mongoose from "mongoose"

const notesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
    type: String,
    required: true
    },
    notes: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Notes = mongoose.models.Notes || mongoose.model("Notes", notesSchema)

export default Notes
