const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JTW_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(202).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 check if email and password exists (remember return)
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2 chick if user exists && password is correct
  // need to have a plus in a fileds which is not selected in model
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3 if everything ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
