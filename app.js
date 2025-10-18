const sequelize = require('./config/database');
const express = require('express');
const app = express();
const path = require('path');
const homeRoutes = require('./routes/homeRoutes');
const session = require('express-session');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');


  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  
  app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));

  const roomRoutes = require('./routes/roomRoutes');
  app.use('/rooms', roomRoutes);
  app.use('/provider', providerRoutes);//Đăng ký nhà cung cấp
  app.use('/', homeRoutes);
  app.use(authRoutes);
  app.use('/provider', providerRoutes);
  sequelize.sync().then(() => {
    app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
  });