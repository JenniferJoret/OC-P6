const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// On définit notre algorithme de cryptage
function mailCrypt(req) {
    const algorithm = process.env.CIPHER_ALGORITHM;
    const ckey = process.env.CIPHER_KEY;
    const key = crypto.createHash('sha256').update(String(ckey)).digest('base64').substr(0, 32);
    const iv = Buffer.alloc(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let mailCrypted = cipher.update(req.body.email, 'utf8', 'hex');
    mailCrypted += cipher.final('hex');
    return mailCrypted;
}

const User = require('../models/user');

//INSCRIPTION UTILISATEUR
exports.signup = (req, res, next) => {
    const mailCrypted = mailCrypt(req)
    bcrypt.hash(req.body.password, 10)

        .then(hash => {

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
    const mailCrypted = mailCrypt(req);
    const tokenKey = process.env.TOKEN_KEY;
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
                            tokenKey, {
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