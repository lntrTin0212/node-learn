const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//139(15:45)

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();
  // SEND RESPONE
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user posts password data
  // (i think this is not neccesary to check)
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  // update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  // console.log(filteredBody);
  // { name: 'trong tin testing', email: 'trongtintesting@gmail.com' }
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  // use findByIdAndUpdate because we dont use validate in UserSchema
  // console.log(user);

  res.status(200).json({
    status: 'success',
    data: updateUser
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
