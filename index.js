require('dotenv').config()

const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdxg6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const database = client.db("cineSphereDB");
        const movieCollection = database.collection("movies");
        const favoriteCollection = database.collection("favorites");

        // add movies 
        app.post('/movies', async (req, res) => {
            const data = req.body;
            const result = await movieCollection.insertOne(data);
            res.send(result);
        });

        // get all the movies
        app.get('/movies', async (req, res) => {
            const searchValue = req.query.search;
            const limit = parseInt(req.query.limit);

            let search = {}
            if (typeof searchValue === 'string' && searchValue.trim() !== '') {
                search = {
                    title: { $regex: searchValue, $options: "i" }
                }
            }
            let query = movieCollection.find(search).sort({ rating: -1 });

            if (limit) {
                query = query.limit(limit);
            }
            const result = await query.toArray();
            res.send(result);
        });

        // get single movie
        app.get('/movies/:id', async (req, res) => {
            const id = req.params.id;
            let query = { _id: new ObjectId(id) }
            const result = await movieCollection.find(query).toArray();
            res.send(result);
        });

        // update movie
        app.put('/movies/:id', async (req, res) => { 
            const id = req.params.id;
            const movie = req.body;
            console.log('update user new data', movie);
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateMovie = {
                $set: {
                    title:movie.title,
                    poster:movie.poster,
                    genre:movie.genre,
                    duration:movie.duration,
                    releaseYear:movie.releaseYear,
                    rating:movie.rating,
                    summary:movie.summary
                }
            }
            const result = await movieCollection.updateOne(filter, updateMovie, option);
            res.send(result);
        });

        // delete movie
        app.delete('/movies/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await movieCollection.deleteOne(query);
            res.send(result);
        });

        // add to favorite
        app.post('/favorites', async (req, res) => {
            const { _id, ...rest } = req.body;
            const favoriteMovie = {
                ...rest,
                _id: new ObjectId(_id),
            };
            const result = await favoriteCollection.insertOne(favoriteMovie);
            res.send(result);
        })

        // get favorite movies by user
        app.get('/favorites', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail };
            const result = await favoriteCollection.find(query).toArray();
            res.send(result);
        })

        // delete favorite movie
        app.delete('/favorites/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await favoriteCollection.deleteOne(query);
            res.send(result);
        });

        


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to Cine Sphere Server')
});

app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
})

/* 

*/