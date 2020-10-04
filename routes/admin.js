var express = require('express');
var router = express.Router();
var users = require('./../inc/users.js');
var admin = require('./../inc/admin.js');
var menus = require('./../inc/menus.js');
var reservations = require('./../inc/reservations.js');
var contacts = require('./../inc/contacts.js');
var emails = require('./../inc/emails.js');
var moment = require('moment');

module.exports = function(io){

    moment.locale("pt-BR");

    router.use(function(req, res, next){

        if(['/login'].indexOf(req.url) === -1 && !req.session.user){
    
            res.redirect('/admin/login');
    
        }else{
    
            next();
    
        }
    
    });
    
    router.use(function(req, res, next){
    
        req.menus = admin.getMenus(req);
    
        next();
    
    });
    
    router.get('/', function (req, res, next){
    
        admin.dashboard().then(data => {
    
            res.render('admin/index', admin.getParams(req, {
    
                data
    
            }));  
    
        }).catch(err => {
    
            console.err(err);
    
        });
    
    });
    
    router.get('/dashboard', function(req, res, next){
    
        reservations.dashboard().then(data => {
    
            res.send(data);
    
        });
    
    });
    
    router.get('/login', function(req, res, next){
    
        users.render(req, res, null);
    
    });
    
    router.post('/login', function(req, res, next){
    
        if(!req.body.email){
    
            users.render(req, res, "Preencha o campo email.");
    
        }else if(!req.body.password){
    
            users.render(req, res, "Preencha o campo senha. ");
    
        }else{
    
            users.login(req.body.email, req.body.password).then(user => {
    
                req.session.user = user;
    
                res.redirect('/admin');
    
            }).catch(err => {
    
                users.render(req, res, (err.message || err));
    
            });
    
        }
    
    });
    
    router.get('/logout', function(req, res, next){
    
        delete req.session.user; 
    
        res.redirect('/admin/login');
    
    });
    
    router.get('/contacts', function(req, res, next){
    
        contacts.getContacts().then(data => {
    
            res.render('admin/contacts', admin.getParams(req, {
    
                data
    
            }));
    
        });
    
    });
    
    router.delete('/contacts/:id', function(req, res, next){
    
        contacts.delete(req.params.id).then(results => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.get('/emails', function(req, res, next){
    
        emails.getEmails().then(data => {
    
            res.render('admin/emails', admin.getParams(req, {
    
                data
    
            }));
    
        });
    
    });
    
    router.delete('/emails/:id', function(req, res, next){
    
        emails.delete(req.params.id).then(results => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.get('/menus', function(req, res, next){
    
        menus.getMenus().then(dataMenus => {
    
            res.render('admin/menus', admin.getParams(req, {
    
                dataMenus
        
            }));
    
        }).catch(err => {
    
            console.error(err);
    
        });
    
    });
    
    router.delete('/menus/:id', function(req, res, next){
    
        menus.delete(req.params.id).then(results => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.post('/menus', function(req, res, next){
    
        menus.save(req.fields, req.files).then(results=> {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.get('/reservations', function(req, res, next){
    
        let start = (req.query.dtstart) ? req.query.dtstart : moment().subtract(1, 'year').format('YYYY-MM-DD');
        let end = (req.query.dtend) ? req.query.dtend : moment().format('YYYY-MM-DD');
    
    
        reservations.getReservations(req).then(pag => {
    
            res.render('admin/reservations', admin.getParams(req, {
    
                date: {
    
                    start, 
                    end
    
                },
                data: pag.data,
                moment,
                links: pag.links
            }
            ));
    
        });
    
    });
    
    router.get('/reservations/chart', function(req, res, next){
    
        req.query.dtstart = (req.query.dtstart) ? req.query.dtstart : moment().subtract(1, 'year').format('YYYY-MM-DD');
        req.query.dtend = (req.query.dtend) ? req.query.dtend : moment().format('YYYY-MM-DD');
    
        reservations.chart(req).then(chartData => {
    
            res.send(chartData);
    
        });
    
    });
    
    router.delete('/reservations/:id', function(req, res, next){
    
        reservations.delete(req.params.id).then(results => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.post('/reservations', function(req, res, next){
    
        reservations.save(req.fields, req.files).then(results=> {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.get('/users', function(req, res, next){
    
        users.getUsers().then(data => {
    
            res.render('admin/users', admin.getParams(req, {
    
                data
    
            }));
    
        });
    
    });
    
    router.delete('/users/:id', function(req, res, next){
    
        users.delete(req.params.id).then((results) => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.post('/users', function(req, res, next){
    
        users.save(req.fields).then((results) => {
    
            res.send(results);
            io.emit('dashboard update');
    
        }).catch(err => {
    
            res.send(err);
    
        });
    
    });
    
    router.post('/users/password-change', function(req, res, next){
    
        users.changePassword(req).then((results) => {
    
            res.send(results);
    
        }).catch(err => {
    
            res.send({
                
                error: err
                
            });
    
    
        });
    
    });

    return router;

};