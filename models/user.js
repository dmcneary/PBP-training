const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
mongoose.promise = Promise


const userSchema = new Schema({
	username: { type: String, unique: true, required: true },
	password: { type: String, unique: false, required: true },
	firstName: { type: String, unique: false, required: true },
    lastName: { type: String, unique: false, required: true },
    gender: { type: String, unique: false, required: true },
	age: { type: Number, unique: false, required: true },
	location: { type: String, unique: false, required: true },
	clubRegionIds: { type: [String], default: [] },
	dateCreated: {type: Date, default: Date.now, required: true }
})


userSchema.methods = {
	checkPassword: function (inputPassword) {
		return bcrypt.compareSync(inputPassword, this.password)
	},
	hashPassword: plainTextPassword => {
		return bcrypt.hashSync(plainTextPassword, 10)
	}
}


userSchema.pre('save', function (next) {
	if (!this.password) {
		console.log('models/user.js =======NO PASSWORD PROVIDED=======')
		next()
	} else {
		console.log('models/user.js hashPassword in pre save');
		this.password = this.hashPassword(this.password)
		next()
	}
})

const User = mongoose.model('user', userSchema)
module.exports = User
