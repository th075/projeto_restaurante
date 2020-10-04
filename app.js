var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');
var client = redis.createClient();
var formidable = require('formidable'); 
var path = require('path');
var http = require('http');
var socket = require('socket.io');

var app = express();

http = http.Server(app);
var io = socket(http);

io.on('connection', function(socket){

  console.log('Usuário Conectado');

});

var indexRouter = require('./routes/index')(io);
var adminRouter = require('./routes/admin')(io);

app.use(function(req, res, next){

  req.body = {};

  if(req.method === 'POST'){

    var form = formidable.IncomingForm({

      uploadDir: path.join(__dirname, "/public/images"),
      keepExtensions: true

    });

    form.parse(req, function(err, fields, files){

      req.body = fields;
      req.fields = fields;
      req.files = files;
      
      next();

    });

  }else{

    next();

  }

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({

  store: new RedisStore({

    host: 'localhost',
    port: 6379,
    client: client
    
  }),

  secret: 'password',
  resave: true,
  saveUninitialized: true

}));

app.use(logger('dev'));
/*app.use(express.json());                          =      DEVIDO A INCOMPATIBILIDADE COM O BODYPARSER POR CAUSA QUE NOS FIZEMOS UM 'DOWNGRADE' DA VERSÃO DO EXPRESS PARA FICAR
app.use(express.urlencoded({ extended: false }));    =     COMPATIVO COM O socket.io, ESSA LINHA TEM QUE SER APAGADA UMA VEZ QUE NOS SOBREESCREVEMOS O  'body parser NA LINHA 45 COM O "req.body = fields"'*/ 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(3000, function(){

  console.log('Servidor rodando...');

});
