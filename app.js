const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) Global MIDDLEWARES

// Set Security HTTP header
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit request from same API
const limiter = rateLimit({
  // allow 100 request from the same IP in one hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour'
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSQL query injecttion
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// serving static file
app.use(express.static(`${__dirname}/public`));

// test middle wear
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // if next method has args => it's a error
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
