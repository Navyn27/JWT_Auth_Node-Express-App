const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Consumer = require("./user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET_TOKEN_KEY;

const connString = "mongodb://localhost/";

const errHandler = (err) => {
  const errors = { email: "", password: "" };
  if (err.code === 11000) {
    errors.email = "A consumer is already registered on this email";
  } else {
    const errBody = Object.values(err);
    errBody.forEach((error) => {
      if (typeof error == "object") {
        errors.email = error.email.message;
        errors.password = error.password.message;
      }
    });
  }
  return errors;
};

const maxAge = 60 * 60 * 24 * 31;

const tokenGen = (input) => {
  const token = jwt.sign({ input }, secret, {
    expiresIn: maxAge,
  });
  return token;
};

app.use(cookieParser());

mongoose
  .connect(connString)
  .then(() => {
    app.listen(2534);
    console.log("Up and racing");
  })
  .catch((err) => {
    console.log(`An error has occured : ${err}`);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { username, email, password } = await req.body;
  console.log("================================================");
  console.log(req.body);
  Consumer.create({ username, email, password })
    .then(() => {
      console.log("Consumer saved");
      res.send("Consumer saved");
    })
    .catch((err) => {
      const response = errHandler(err);
      res.status(400).json(response);
    });
});

app.post("/login", async (req, res) => {
  const { username, email, password } = await req.body;
  try {
    const user = Consumer.login(username, email, password);
    user.then(async (data) => {
      const auth = await bcrypt
        .compare(password, data.password)
        .then(async (results) => {
          const token = tokenGen(data._id.toString());
          res.cookie("jwt-token", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          res.send("User Logged In");
          console.log("User logged in");
        })
        .catch((err) => {
          console.log(err);
          res.send("Invalid Email or password");
        });
    });
  } catch (err) {
    res.send(err);
    console.log("An error has occured");
    console.log(err);
  }
});
