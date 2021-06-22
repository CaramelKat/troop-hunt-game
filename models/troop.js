const { Schema, model } = require('mongoose');

const TroopSchema = new Schema({
    troop_number: String,
    troop_guide: String,
    session: Number,
    points: Number,
    questions: [Object],
}, { collection: 'troops' });


TroopSchema.methods.addPoints = async function(points) {
    const old_points = this.get('points');
    this.set('points', old_points + points);

    await this.save();
};

TroopSchema.methods.removePoints = async function(points) {
    const old_points = this.get('empathy_count');
    this.set('empathy_count', old_points - points);

    await this.save();
};

TroopSchema.methods.addQuestion = async function(question_id) {
    this.questions.push(question_id);
    await this.save();
};

TroopSchema.methods.hasQuestion = async function(question_id) {
    return this.questions.indexOf(question_id) !== -1;
};

const Troop = model('TROOP', TroopSchema);

module.exports = {
    TroopSchema,
    TROOP: Troop
};