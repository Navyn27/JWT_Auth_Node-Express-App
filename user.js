const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
// const { exist } = require("joi");

const schema = mongoose.Schema;

const usersSchema = new schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [isEmail, "The entered email is invalid"],
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password should be at least 8 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

usersSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

usersSchema.statics.login = async (username, email, password) => {
  const user = await Consumer.findOne({ email });
  if (user) {
    return user;
  } else {
    console.log("User not found");
  }
};

const Consumer = mongoose.model("consumer", usersSchema);

module.exports = Consumer;
