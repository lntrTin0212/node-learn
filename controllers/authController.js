const { promisify } = require('util');
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
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt
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
    // 400: Bad request
  }
  // 2 chick if user exists && password is correct
  // need to have a plus in a fileds which is not selected in model
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
    // 401: Not authorized
  }

  // 3 if everything ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.substr(7);
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to continue!', 401)
      // 401: Not authorized
    );
  }

  // 2 Vertification token
  const decoded = await promisify(jwt.verify)(token, process.env.JTW_SECRET);
  // 3 check if user still exists
  const freshUser = await User.findById(decoded.id);
  // console.log(freshUser);
  if (!freshUser) {
    return next(
      new AppError(
        'the user belonging to this token does no longer exist.',
        401
      )
    );
  }
  // 4 Check if user changed password after the token was issued
  // iat: JWTTimeStamp
  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    // console.log('oh no!. User recently changed password!, please log in again');
    return next(
      new AppError(
        'oh no!. User recently changed password!, please log in again',
        401
      )
    );
  }
  // Grant access to proteced route
  req.user = freshUser;
  next();
});
