const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder
        console.log(req.route.path)
        if(req.route.path == '/imageUpload')
            folder = 'images/' + (req.user.type == 1? 'users' : 'doctors')
        else if(req.route.path == '/license')
            folder = 'licenses'
        cb(null, __dirname + '/../public/' + folder)
    },
    filename: (req, file, cb) => {
        let filename = req.user.userId + file.originalname.substring(file.originalname.lastIndexOf('.'))
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