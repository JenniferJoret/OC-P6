const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');

// On définit notre algorithme de cryptage
var algorithm = 'aes256';

var password = 'l5JmP+G0/1zB%;r8B8?2?2pcqGcL^3';

const User = require('../models/user');

//INSCRIPTION UTILISATEUR
exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)

        .then(hash => {
            var mailCrypted = mailCrypt(req);

            console.log(mailCrypted);

            const user = new User({
                email: mailCrypted,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({
                    message: 'Utilisateur créé !'
                }))
                .catch(error => res.status(400).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};

//CONNEXION UTILISATEUR
exports.login = (req, res, next) => {
    var mailCrypted = mailCrypt(req);

    User.findOne({
            email: mailCrypted
        })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrect !'
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({
                                userId: user._id
                            },
                            '6*"n$bzJF~@O3Jfi#6[9POcWQuF^8%', {
                                expiresIn: '24h'
                            }
                        )
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};

function mailCrypt(req) {
    var cipher = crypto.createCipher(algorithm, password);
    var mailCrypted = cipher.update(req.body.email, 'utf8', 'hex');
    mailCrypted += cipher.final('hex');
    return mailCrypted;
}
