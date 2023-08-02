const express = require("express");
const Favorite = require("../models/favorite");
const favoriteRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");

const verifyRequestBody = (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        next();
    } else {
        const err = new Error("Request body is empty or missing.");
        err.status = 400;
        return next(err);
    }
};

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) =>
        res.sendStatus(200)
    )
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("User")
            .populate("Campsite")
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(
        cors.corsWithOptions,
        authenticate.verifyUser,
        verifyRequestBody,
        (req, res, next) => {
            Favorite.findOne({ user: req.user._id })
                .then((user) => {
                    if (!user) {
                        Favorite.create({
                            user: req.user._id,
                            campsites: req.body,
                        }).then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        });
                    } else {
                        const currentFavoriteCampsites = user.campsites.map(
                            (campsite) => campsite
                        );

                        const campsitesToAdd = req.body.filter(
                            (campsite) =>
                                !currentFavoriteCampsites.includes(campsite._id)
                        );

                        if (campsitesToAdd.length > 0) {
                            const campsiteIdsToAdd = campsitesToAdd.map(
                                (campsite) => campsite._id
                            );
                            user.campsites.push(...campsiteIdsToAdd);

                            user.save().then((updatedFavorite) => {
                                res.statusCode = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(updatedFavorite.campsites);
                            });
                        } else {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(user.campsites);
                        }
                    }
                })
                .catch((err) => next(err));
        }
    )
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((response) => {
                res.statusCode = 200;
                if (response) {
                    res.setHeader("Content-Type", "application/json");
                    res.json(response);
                } else {
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete");
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) =>
        res.sendStatus(200)
    )
    .get(cors.cors, (req, res) => {
        res.statusCode = 403;
        res.end(
            `GET operation not supported on /favorites/${req.params.campsiteId}`
        );
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((user) => {
            if (!user) {
                Favorite.create({
                    user: req.user._id,
                    campsites: [{ _id: req.params.campsiteId }],
                }).then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                });
            } else {
                const currentFavoriteCampsites = user.campsites.map(
                    (campsite) => campsite
                );
                if (!currentFavoriteCampsites.includes(req.params.campsiteId)) {
                    user.campsites.push(req.params.campsiteId);
                    user.save().then((updatedFavorite) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(updatedFavorite.campsites);
                    });
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end(
                        "That campsite is already in the list of favorites!"
                    );
                }
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(
            `PUT operation not supported on /favorites/${req.params.campsiteId}`
        );
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((user) => {
            {
                if (user) {
                    const currentFavoriteCampsites = user.campsites.map(
                        (campsite) => campsite
                    );

                    if (
                        currentFavoriteCampsites.includes(req.params.campsiteId)
                    ) {
                        const campsitesToKeep = currentFavoriteCampsites.filter(
                            (favorite) =>
                                favorite._id.toString() !==
                                req.params.campsiteId
                        );
                        user.campsites = campsitesToKeep;
                        user.save().then((updatedFavorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(updatedFavorite.campsites);
                        });
                    } else {
                        res.statusCode = 404;
                        res.setHeader("Content-Type", "text/plain");
                        res.end("The campsite is not in your favorites.");
                    }
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("No favorites to delete!");
                }
            }
        });
    });

module.exports = favoriteRouter;
