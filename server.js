var express = require("express");
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
const server = app.listen(5000);
const io = require('socket.io')(server);
app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
const sessionmiddleware = session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
})
app.use(sessionmiddleware)
app.use(bodyParser.urlencoded({ extended: true }));

// express and socket.io share session setting
io.use(function(socket, next) {
    sessionmiddleware(socket.request, socket.request.res, next);
});
////



app.get('/', function(req, res) {
    res.render('index')
})



var person = {};
var mes = [];

io.on('connection', function(socket) {
    console.log(socket.id)
    socket.on('me', function(data) {



        socket.broadcast.emit('other', { 'info': data.name + ' come into chat room !' });
        var str = '';
        for (var x in person) {
            str += person[x] + ', ';
        }
        str.length = str.length - 2;
        socket.emit('newin', { 'data': str });
        person[socket.id] = data.name;
        console.log(person);
    });


    socket.on('send', function(data) {
        var message = data.mes;
        var obj = {}
        obj[person[socket.id]] = message;
        mes.push(obj);
        io.emit('mes', { 'data': mes });
        console.log(mes);
    })


    socket.on('disconnect', function(data) {

        io.emit('other', { info: person[socket.id] + ' leave chat room' });
        delete person[socket.id]
    });

})