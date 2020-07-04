const { Schema, model } = require('mongoose');

const QuestionSchema = new Schema({
    question_id: String,
    question_text: String,
    question_value: Number,
}, { collection: 'questions' });

const Question = model('QUESTION', QuestionSchema);

module.exports = {
    QuestionSchema,
    QUESTION: Question
};