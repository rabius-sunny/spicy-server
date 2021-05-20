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
    console.log(err ? err : 'Database Connected Successfully')

    const productsCollection = client.db("spicydata").collection("products");
    const shopkeeperCollection = client.db("spicydata").collection("shopkeepers");
    const generaluserCollection = client.db("spicydata").collection("general");

    // Create Shopkeeper user
    server.post('/vendor/signup', (req, res) => {
        const shopkeeperUser = req.body;
        shopkeeperCollection.insertOne(shopkeeperUser)
            .then(result => res.sendStatus(200))
            .catch(err => console.log(err))
    })

    // Create General user
    server.post('/user/signup', (req, res) => {
        const generalUser = req.body;
        generaluserCollection.insertOne(generalUser)
            .then(result => res.send(result))
    })

    //  Authenticate General user
    server.get('/user/login/:email/:pass', (req, res) => {
        const email = req.params.email;
        const password = req.params.pass;
        generaluserCollection.find({ email: email, password: password })
            .toArray((err, result) => {
                if (result.length) {
                    res.sendStatus(200)
                } else {
                    res.sendStatus(404)
                }
            })
    })

    //  Authenticate Shopkeeper and get the Data
    server.get('/vendor/login/:num/:pass', (req, res) => {
        const number = req.params.num;
        const password = req.params.pass;
        shopkeeperCollection.find({ number: number, password: password })
            .toArray((err, result) => {
                if (err) {
                    console.log(err)
                } else if (result.length) {
                    productsCollection.find()
                        .toArray((err, products) => res.send(products))
                } else {
                    res.sendStatus(404)
                }
            })
    })

});

server.listen(PORT, () => console.log('Server is Listening'))
