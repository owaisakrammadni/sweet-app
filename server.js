var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require("path");
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const fs = require('fs')
const multer = require('multer')
const admin = require("firebase-admin");

var { userModle, shopCartModel, sweetOrdersModel } = require("./dbrepo/modles");
var authRoutes = require("./routes/auth")
console.log(userModle, shopCartModel, sweetOrdersModel)

var { SERVER_SECRET } = require("./core/index");

const PORT = process.env.PORT || 5000;


var app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));
app.use('/', authRoutes)

app.use(function (req, res, next) {
    console.log('cookie', req.cookies)

    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    console.log("Asign value of token" , req.cookies.jToken)

    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        console.log("decodedData .................>>>>>>>>>>" , decodedData)
        if (!err) {
            const issueDate = decodedData.iat * 1000
            const nowDate = new Date().getTime()
            const diff = nowDate - issueDate

            if (diff > 30000) {
                res.status(401).send('Token Expired')

            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    role: decodedData.role
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                })
                req.body.jToken = decodedData
                req.headers.jToken = decodedData
                next()
            }
        } else {
            res.status(401).send('invalid Token')
        }

    });

})

////// Get profile and user data in user interface
////// Get profile and user data in user interface
////// Get profile and user data in user interface

app.get('/profile', (req, res, next) => {

    console.log(req.body)


    userModle.findById(req.body.jToken.id, "name email phone role gender cratedOn",
        function (err, data) {
            console.log(data)
            if (!err) {
                res.send({
                    profile: data
                })
            } else {
                res.status(404).send({
                    message: "server err"
                })
            }

        })

})

//////Cart Upload Api
//////Cart Upload Api
//////Cart Upload Api
//////Cart Upload Api

const storage = multer.diskStorage({
    destination: './upload/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

//==============================================

var SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "sweet-shop-d3796",
    "private_key_id": "fab6ddb31089f73c84a4b528e4894a8ae70c1136",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCbLvxwHcR+Aw9\nd2MPR64MUTSy2f6ReTuEeWUtpZc0b8Nox7/AgptloslzM+RYLgf8kDPthal2tXmF\n8VZ972GTqx6XsoKLC8pKHyg5PFVLO9IPTwSn+OOeLmA5xOeB/box+GUT3r46kFhj\n/wI9wLd7RAoexV8T2L47bGGBay6ydDZ9VkB81wnCzCSepurLRWKqLyS7L5tzntVB\ntZN36yqD//6FNS3kpTgNYJX+9qfdjlkLbJj7Xb/EBokPe4OcylGaKEV5QmkdkdpP\ne9Ef+vq961A22uneR8W7G73llA91llp+Y7Awb8C5pigEDfNRl9bFaAqma1kmEeRs\nDcaTxAoDAgMBAAECggEAXrDTdmIM+9DpsTQIqGP6RiB0wJjATbyUOqhfGTS5aD34\nl3sVjl5t7bmzUGrZDwNYO29GAywihWDML2qDe/FO/jsMusgjoTHcU25KSlnylqIr\nY+5Rr7ddsGgY0HnwYNSgzv6Rx/QnhOFRU15bCpVmJ2BTZ3osHL/moo1eDciUZS+v\n0a8zs/kUngDfEBFPFj4CVerHJ43JL+pX+jxmPq97GZsjF7zUGxHhAyER+iqN2X0s\nwkz20RfoZXNE5MMdKkLDAmPqFSxsfJkmpeGMsPL62aTIFi2BiToBg9TtNF8TL9Zk\nOf1jjrQOBpb2s8SrH6ij7zdAP0uvddz7ebjteeiN3QKBgQDq6FC53zHEdvB0eIIH\nqM0z9ltOhl5k2uzYEhHqMhNicrJSXpD60pRPFLxetxF/HTYQylWRElX/k3M6CbKK\nKhUGMulqt5G/8FCkb7TIZF5FvYfDXN4rpek7UQxWq7uP7nZ59gVcLnVhStwKf5M8\nXzBPbmCkuZpI7CQXJsB2f8u5JwKBgQDT4d15BRANzms0f6IOinEGCRRnlPh5r4uT\ndtVncMMsvDub3tfaMGMsxqAbzxloezdy2ddaDhY8V9R//bZiNj8s8MS1J/h0VHtF\nuOSSoMlUjg14GFAyqKzMTaweOcRrJgx0gaqeOl9soA4ZHc6Qp52mVw40Knx7Xutp\nvVUddmBZxQKBgQDZxU0xQ20LyYfZMe650w+JYJX9EixoK1zuYrIg/xNhbRtLqUeW\nf6nmNj77P5QE17vLjQgOWYVIThXAdEUEOUcMXB5wRIXl/o+EIdri+8k5th8qSend\nZQ33Y4egwcw7/sHvBtipQJio/ZFIWkTQ7x4GRTlq/HW/rMs4e0BpmsfueQKBgEgD\n9eXDPcCjjzaJxwgQL/gwL9pA/O9HJjaZ5lDBN+VFmTESXeVQGvVGEXdCPc2QS7li\np1p5fT9HTvetwUbCT1i0APfdvQm1CS0aeb4InkV5/sP555BAWnMaV0zyr3sHtKYI\nyHf9OR/PitsokWQDRIccAbzjT+oSygrnij14ValNAoGAH5FPUBGRy3c8b9csZz6u\nU1j5HubjguAtPmP5P1cuoWWB1wDMWe5YYp1F0dRCvVALU1YFx0z/nXD9749llLEM\nNSDDUDLFvUVnMuQkIuT52GNhZTwCZTlJ1ocZKeAM7rDkXPJbOOwjm2l3+VhG+OEN\nFP6FetUVcE3zrIGkfJSPyLk=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-qdjvv@sweet-shop-d3796.iam.gserviceaccount.com",
    "client_id": "109375531723273803429",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qdjvv%40sweet-shop-d3796.iam.gserviceaccount.com"
  }
  
admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    DATABASE_URL: "https://sweet-shop-95e0d-default-rtdb.firebaseio.com/"
});

const bucket = admin.storage().bucket("gs://sweet-shop-d3796.appspot.com");

//==============================================

app.post("/uploadcart", upload.any(), (req, res, next) => {

    bucket.upload(
        req.files[0].path,

        function (err, file, apiResponse) {
            if (!err) {
                console.log("api resp: ", apiResponse);

                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
              
                    if (!err) {
                        // console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                        console.log(req.body.email)
                        console.log( "headerskdflasfjks ka data  ===================>>>>> " ,req.headers.jToken.id)
                        console.log( "headerskdflasfjks request headers  ===================>>>>> " ,req.headers)
                        userModle.findById(req.headers.jToken.id, 'email role', (err, users) => {
                            console.log("Adminperson ====> ", users.email)

                            if (!err) {
                                shopCartModel.create({
                                    "title": req.body.title,
                                    "price": req.body.price,
                                    "availability": req.body.availability,
                                    "cartimage": urlData[0],
                                    "description": req.body.description
                                })
                                    .then((data) => {
                                        console.log(data)
                                        res.send({
                                            status: 200,
                                            message: "Product add successfully",
                                            data: data
                                        })

                                    }).catch(() => {
                                        console.log(err);
                                        res.status(500).send({
                                            message: "Not added, " + err
                                        })
                                    })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                            //file removed
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})


////// Get Products frrom Database in user Interfase
////// Get Products frrom Database in user Interfase
////// Get Products frrom Database in user Interfase
////// Get Products frrom Database in user Interfase
////// Get Products frrom Database in user Interfase


app.get('/getProducts', (req, res, next) => {
    shopCartModel.find({}, (err, data) => {
        if (!err) {
            res.send({
                data: data
            })
        }
        else {
            res.send(err)
        }
    })
})


/////// Save order in Database
/////// Save order in Database
/////// Save order in Database
/////// Save order in Database
/////// Save order in Database


app.post("/order", (req, res, next) => {
    console.log("fsfsf", req.body)
    if (!req.body.orders || !req.body.total) {

        res.status(403).send(`
            please send email and passwod in json body.
            e.g:
            {
                "orders": "order",
                "total": "12342",
            }`)
        return;
    }

    userModle.findOne({ email: req.body.jToken.email }, (err, user) => {
        console.log("afafa", user)
        if (!err) {
            sweetOrdersModel.create({
                name: req.body.name,
                phone: req.body.phone,
                address: req.body.address,
                email: user.email,
                orders: req.body.orders,
                total: req.body.total
            }).then((data) => {
                res.status(200).send({
                    message: "Order have been submitted",
                    data: data
                })
            }).catch(() => {
                res.status(500).send({
                    message: "order submit error, " + err
                })
            })
        }
        else {
            console.log(err)
        }
    })
})


/////// Get all orders in Admin panel 
/////// Get all orders in Admin panel 
/////// Get all orders in Admin panel 
/////// Get all orders in Admin panel 
/////// Get all orders in Admin panel 


app.get('/getorders', (req, res, next) => {
    sweetOrdersModel.find({}, (err, data) => {
        console.log("dlfsdjlaskdfj data datat tatdta + ", data)
        if (!err) {
            res.send({
                data: data
            })
        }
        else {
            res.send(err)
        }
    })
})

app.listen(PORT, () => {
    console.log("surver is running on : ", PORT)
});







