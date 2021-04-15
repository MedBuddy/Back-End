const jwt = require('jsonwebtoken')
const { secretKey } = require('./credentials')

exports.getToken = (user) => {
    const token = jwt.sign(user, secretKey)
    return token
}

exports.verifyUser = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null){
        err = new Error('No Token Found')
        err.status = 401
        return next(err)
    }
    jwt.verify(token, secretKey, (err, user) => {
        if(err){
            err = new Error('Invalid Token')
            err.status = 403
            return next(err)
        }
        req.user = user
        next()
    })
}

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin)
        next()
    else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}