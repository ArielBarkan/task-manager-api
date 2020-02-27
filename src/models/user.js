const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(v) {
            if (!validator.isEmail(v)) {
                throw new Error('Email is invalid');

            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(v) {
            if (validator.contains(v.toLowerCase(), 'password')) {
                throw new Error('PasswOrd can\'t contain the string "password"');
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Removing/Hiding irrelevant & sensitive data from the returned object
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password
    delete user.tokens
    delete user.avatar
    delete user.__v
    return user;
}

// Generating and saving JWT for the user
userSchema.methods.generateAndSaveAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id
    }, process.env.jwtSecret, {
        expiresIn: '1 week'
    })
    user.tokens = user.tokens.concat({
        token
    })
    await user.save();
    return token
}

// Finding user by provided credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new Error('Can\'t login!')
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
        throw new Error('Can\'t login!')
    }
    return user;
}
// Removing all the tasks for the user when thew user is removed
userSchema.pre('remove', async function (next) {
    const userToRemove = this

    const tasksToDelete = await Task.deleteMany({
        owner: userToRemove._id
    });


    next()
})

// Hash the plain text password before saving 
userSchema.pre('save', async function (next) {
    const userToSave = this;
    console.log("before save!");
    if (userToSave.isModified('password')) {
        userToSave.password = await bcrypt.hash(userToSave.password, parseInt(process.env.salt));
    }

    next();
})


const User = mongoose.model('User', userSchema);



module.exports = User;