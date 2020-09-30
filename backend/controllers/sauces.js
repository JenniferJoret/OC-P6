const Sauce = require('../models/sauce');
const fs = require('fs');

//CRÉER SAUCE
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistrée !'
        }))
        .catch(error => res.status(400).json({
            error : error
        }));
};

//RÉCUPÉRER UNE SAUCE
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

//MODIFIER SAUCE
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    };
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlinkSync(`images/${filename}`);
            }
            updateSauce(req, sauceObject, res);
        })
        .catch(error => res.status(500).json({
            error
        }));

};

//SUPPRIMER SAUCE
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlinkSync(`images/${filename}`);
                Sauce.deleteOne({
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'Sauce supprimée !'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            ;
        })
        .catch(error => res.status(500).json({
            error
        }));
};

//RÉCUPÉRER TOUTES LES SAUCES
exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

//GESTION DES LIKES DE SAUCES
exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;

    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            if (like == 1) {
                sauce.usersLiked.push(userId);
                sauce.likes += 1;
            } else if (like == 0) {
                if (sauce.usersLiked.includes(userId)) {
                    sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                    sauce.likes -= 1;
                }
                if (sauce.usersDisliked.includes(userId)) {
                    sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                    sauce.dislikes -= 1;
                }
            } else if (like == -1) {
                sauce.usersDisliked.push(userId);
                sauce.dislikes += 1;
            }
            sauce.save()
                .then(() => res.status(200).json({
                    message: 'Vote comptabilisé !'
                }))
                .catch(error => res.status(400).json({
                    error: error
                }));
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );

};

//METTRE LA SAUCE À JOUR
function updateSauce(req, sauceObject, res) {
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })

        .then(() => res.status(200).json({
            message: 'Sauce modifiée !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
}