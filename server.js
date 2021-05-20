const express = require('express')
const server = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config()

server.use(cors());
server.use(bodyParser.json());

const PORT = process.env.PORT || 4040;

server.get('/', (req, res) => {
    res.send('Root Derectorys')
})

const uri = `mongodb+srv://users:${process.env.PASS}@cluster0.jat59.mongodb.net/spicydata?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(err ? err : 'Databse Connected Successfully')
    const productsCollection = client.db("spicydata").collection("products");
    const shopkeeperCollection = client.db("spicydata").collection("shopkeepers");
    const generaluserCollection = client.db("spicydata").collection("general");

    // Create Shopkeeper user
    server.post('/vendor/signup', cors(), (req, res) => {
        const shopkeeperUser = req.body;
        shopkeeperCollection.insertOne(shopkeeperUser)
            .then(result => res.send(result))
    })

    // Create General user
    server.post('/user/signup', (req, res) => {
        const generalUser = req.body;
        generaluserCollection.insertOne(generalUser)
            .then(result => res.send(result))
    })

    // 
    server.get('/user/login', (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        generaluserCollection.find({ email: email, password: password })
            .then((err, result) => console.log(err ? err : result))
    })

    // 
    server.get('/vendor/login', (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        shopkeeperCollection.find({ email: email, password: password })
            .then((err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    productsCollection.find()
                        .toArray((err, products) => res.send(products))
                }
            })
    })

});

server.listen(PORT, () => console.log('Server is Listening'))
