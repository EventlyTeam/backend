require('dotenv').config()
const PORT = process.env.PORT || 5000
const path = require('path');

const cors = require('cors')
const express = require('express')
const session = require('express-session')
const swaggerUi = require('swagger-ui-express');

const errorHandler = require('./middleware/errorHandlingMiddleware')
const sequelize = require('./config/sequelize');
const router = require('./routes/index')
const passport = require('./config/passport');
const swaggerDocument = require('./config/swagger/config');

const app = express()

app.use(cors({
  credentials: true,
  origin: process.env.REACT_PATH
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', router)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler)

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync({ alter: true });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
})