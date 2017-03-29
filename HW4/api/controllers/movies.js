/**
 * Created by JoshuaBrummet on 3/26/17.
 */
'use strict';

var _ = require('lodash');
var usergrid = require('usergrid');
var apigee = require('apigee-access');

var UsergridClient = require('../../node_modules/usergrid/lib/client');
var Usergrid = new UsergridClient({
    "appId": "sandbox",
    "orgId": "brummetj",
    "authMode": "NONE",
    "baseUrl": "https://apibaas-trial.apigee.net",
    "URI": "https://apibaas-trial.apigee.net",
    "clientId": "b3U6YApQFgU6EeeEdxIuBzeXfQ",
    "clientSecret": "b3U6jlcYT4R848HaUp1gnVD1-LSF1CY"
});
module.exports = {

    index: index,
    create: create,
    show: show,
    update: update,
    destroy: destroy

};

function index (req,res){

    Usergrid.GET('movies', function(err, response, movie) {
        //Getting all movies from apige BaaS
        if(err){
            res.json({error: err});
        }
        else {
            console.log(response.entities);
            res.json({
                movies: response.entities
            }).end();
        }
    })
}
function create (req,res){

    var movies = req.swagger.params.movie.value.movie;
    _.assign(movies,{type: 'movie'}); //Movies require a type field.

    if(_.isUndefined(movies.actors) || _.isUndefined(movies.title) || _.isUndefined(movies.year)
        || _.isUndefined(movies.genre)) {

        res.json({
            Error: "Movies values undefined. Are you missing actors, title, year, or genre?"
        });
    }
    else
        Usergrid.POST(movies, function (err, response, movie) {
            if (err) {
                res.json({message: err});
            }
            else {
                movie.save(Usergrid, function (err) {

                    if (err) {
                        res.status(500).json(err).end();
                    }
                    else res.json({
                        message: 'movie created',
                        movie: response
                    }).end();
                });
            }
        })
}
function show(req,res){

    var uuid = req.swagger.params.movieId.value;
    Usergrid.GET('movies',uuid, function(error, usergridResponse) {
        // if successful, entity be correct movie
        if (error){
            res.json({error: error});
        }
        else res.json({
            movie: usergridResponse
        }).end();
    })
}
function update(req,res){
    
    var uuid = req.swagger.params.movieId.value;

    Usergrid.GET('movies', uuid, function(error, usergridResponse, movie) {
        // if successful, assign movie with new values.
        _.assign(movie, req.swagger.params.movie.value.movie);
        _.assign(movie, {type: 'movie'}); //Post requires a "type":

        Usergrid.POST(movie, function (err, response, newMovie) {
            if(err){
                res.json({
                    error: err
                });
            }
            else newMovie.save(Usergrid, function (err) {
                if (err) {
                    res.status(500).json(err).end();
                }
                res.json({
                    message: 'movie updated',
                    movie: response
                }).end();
            });
        });
    })
}
function destroy(req,res){

    var uuid = req.swagger.params.movieId.value;
    Usergrid.DELETE('movies',uuid, function(error, usergridResponse) {
        // if successful, entity will now be deleted
        if (error) {
            res.json({error: error});
        }
        else res.json({
            message: 'movie deleted',
            movie: usergridResponse
        }).end();
    })
}
