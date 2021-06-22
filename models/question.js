const { Schema, model } = require('mongoose');

const QuestionSchema = new Schema({
    question_text: String,
    question_value: Number,
    reusable: {
        type: Boolean,
        default: false
    }
}, { collection: 'questions' });

const Question = model('QUESTION', QuestionSchema);

module.exports = {
    QuestionSchema,
    QUESTION: Question
};