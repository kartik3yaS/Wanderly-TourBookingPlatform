const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    // Create new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'user',
      active: req.body.active === 'true',
    });

    // If photo was uploaded, it will be processed by uploadUserPhoto and resizeUserPhoto middleware
    if (req.file) {
      newUser.photo = req.file.filename;
      await newUser.save({ validateBeforeSave: false }); // Skip validation when just updating photo
    }

    // Remove password from output
    newUser.password = undefined;
    newUser.passwordConfirm = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 11000,
          message: 'Email address is already registered',
        },
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join('. '),
      });
    }
    // Pass other errors to global error handler
    next(error);
  }
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = catchAsync(async (req, res, next) => {
  try {
    // 1) Get user document
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // 2) Create update object with basic fields
    const updateData = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      role: req.body.role || user.role,
      active: req.body.active === 'true',
    };

    // 3) Handle photo upload
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    // 4) Handle password update if both password fields are provided
    if (req.body.password && req.body.passwordConfirm) {
      updateData.password = req.body.password;
      updateData.passwordConfirm = req.body.passwordConfirm;
    }

    // 5) Update the user using findByIdAndUpdate to avoid running password validation when not updating password
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // If updating password, we need to use save() to trigger the password hashing
    if (req.body.password && req.body.passwordConfirm) {
      await updatedUser.save();
    }

    // 6) Remove sensitive data from response
    updatedUser.password = undefined;
    updatedUser.passwordConfirm = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 11000,
          message: 'Email address is already registered',
        },
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join('. '),
      });
    }
    // Pass other errors to global error handler
    next(error);
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // Check if user is trying to delete themselves
  if (req.user.id === req.params.id) {
    return next(
      new AppError(
        'You cannot delete your own account while logged in. Please contact another administrator.',
        403
      )
    );
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Delete the user
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});
