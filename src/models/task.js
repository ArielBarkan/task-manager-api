const mongoose = require('mongoose');


const tasksSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

tasksSchema.pre('findOneAndUpdate', function (next) {
    console.log("Before update");
    next();
});

tasksSchema.pre('save', function (next) {
    console.log("Before save");
    next();
});
// Removing/Hiding irrelevant & sensitive data from the returned object
tasksSchema.methods.toJSON = function () {
    const task = this.toObject();
    /*   delete task.owner */
    delete task.__v
    return task;
}

//  Creating mongoose model for Task
const Task = mongoose.model('Task', tasksSchema);

module.exports = Task;