const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Get reviews for the currently logged-in user
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate({
      path: 'tour',
      select: 'name imageCover',
    })
    .sort('-createdAt'); // Sort by newest first

  // Filter out any null tour references and format the response
  const formattedReviews = reviews.map((review) => {
    const reviewObj = review.toObject();
    if (!reviewObj.tour) {
      reviewObj.tour = {
        name: 'Tour no longer available',
        _id: null,
      };
    }
    return reviewObj;
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews: formattedReviews,
    },
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
