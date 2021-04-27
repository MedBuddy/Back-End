const multer = require('multer')
const fs = require('fs')

exports.getFilePath = (path) => {
    return path.substring(path.indexOf('public') + 6)
}

exports.deleteFiles = (oldFiles, userId, dest) => {
    let folder = __dirname + '/../public/' + dest + '/' + userId + '/'
    const files = oldFiles
    files.forEach(filepath => {
        let filename = filepath.substring(filepath.lastIndexOf('\\') + 1)
        fs.rm(folder + filename, { recursive: true }, err => {
            if(err)
                return console.error(err)
            console.log('File Deleted:', filename)
        })
    })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder
        if(req.route.path == '/imageUpload')
            folder = 'images/' + (req.user.type == 1? 'users' : 'doctors')
        else if(req.route.path == '/license')
            folder = 'licenses'
        cb(null, __dirname + '/../public/' + folder)
    },
    filename: (req, file, cb) => {
        let filename = req.body.userId + file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, filename)
    }
})

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/)) {
        return cb(new Error('You can upload only image files!'), false)
    }
    cb(null, true)
}

const pdfFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.pdf$/)) {
        return cb(new Error('You can upload only PDF files!'), false)
    }
    cb(null, true)
}

const IMAGE_MAX = 500 * 1024
const PDF_MAX = 1* 1024 * 1024

exports.uploadImage = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: IMAGE_MAX } })
exports.uploadPdf = multer({ storage: storage, fileFilter: pdfFileFilter, limits: { fileSize: PDF_MAX } })

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = __dirname + '/../public/posts/' + req.user.userId
        fs.mkdir(folder, { recursive: true }, (err) => {
            if(err)
                return console.error(err)
            //console.log('Folder Created!')
        })
        cb(null, folder)
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + '-' + file.originalname
        cb(null, filename)
    }
})

const POST_MAX = 10 * 1024 * 1024

exports.uploadPost = multer({ storage: postStorage, limits: { fileSize: POST_MAX } })

const queryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = __dirname + '/../public/queries/' + req.user.userId
        fs.mkdir(folder, { recursive: true }, (err) => {
            if(err)
                return console.error(err)
            //console.log('Folder Created!')
        })
        cb(null, folder)
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + '-' + file.originalname
        cb(null, filename)
    }
})

const QUERY_MAX = 10 * 1024 * 1024

exports.uploadQuery = multer({ storage: queryStorage, limits: { fileSize: QUERY_MAX } })