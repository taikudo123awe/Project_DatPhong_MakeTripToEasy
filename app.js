require('dotenv').config();

const sequelize = require('./config/database');
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const providerRoutes = require('./routes/providerRoutes');
const customerRoutes = require('./routes/customerRoutes');//Thêm
require('./models/associations');// Thêm dòng này để thiết lập các liên kết

require('./models/associations');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));
  
  app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
   res.locals.customer = req.session.customer || null;
   next();
});

app.use('/rooms', roomRoutes);
app.use('/provider', providerRoutes);
app.use('/', homeRoutes);
app.use(authRoutes);
app.use('/customer', customerRoutes);//Thêm
sequelize.sync().then(() => {
app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
});

