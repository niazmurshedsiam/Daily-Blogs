const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

const port = 4000;


app.get('/', function (req, res) {
    res.send('hello world....')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssth5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const blogCollection = client.db("daily-blogs").collection("blogs");
    const adminCollection = client.db("daily-blogs").collection("admin");

    app.post('/addBlog', (req, res) => {
        const newBlog = req.body;
        blogCollection.insertOne(newBlog)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/admin', (req, res) => {
        adminCollection.find({ email: req.query.email })
            .toArray((err, admin) => {
                if (admin.length === 0) {
                    res.send([])
                }
                else {
                    adminCollection.find()
                        .toArray((err, documents) => {
                            res.send(documents)
                        })
                }
            })
    })

    app.get('/manageBlog', (req, res) => {
        blogCollection.find()
            .toArray((err, blogs) => {
                res.send(blogs)
            })
    })

    app.delete('/delete/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        console.log("delete this", id)
        blogCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))

    })

    app.get('/allBlogs', (req, res) => {
        blogCollection.find()
            .toArray((err, blogs) => {
                res.send(blogs)
            })
    })

    app.get('/singlePost/:id', (req, res) => {
        blogCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, blog) => {
                res.send(blog)
            })
    })
});




app.listen(process.env.PORT || port)