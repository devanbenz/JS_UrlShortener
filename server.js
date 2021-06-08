require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('dns')
// Basic Configuration
const port = process.env.PORT || 3000;

const urlRegex = new RegExp('(^http|https):\/\/www\.[a-zA-Z0-9]*\.[a-zA-Z0-9]*')

// ------------------------ MONGO DB STUFF ----------------------------------------------
// MongoDB uri
const uri = 'mongodb+srv://devan:GWgJc5Uh9YP1lAH7@free-cc-cluster.dq2ed.mongodb.net/'
// Connect to mongodb with mongoose 
const db = mongoose.connect(uri, {useNewUrlParser:true, useUnifiedTopology: true})

// Create url schema 
const UrlSchema = mongoose.Schema({
  url: String,
  id: Number
})
// Create a URL model out of the schema 
const Urls = mongoose.model('Urls', UrlSchema)
//-----------------------------------------------------------------------------------------

// Middlewares 
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Create an id counter - need to increment per post so that way the db stores the urls 
let urlCount = 0

app.post('/api/shorturl', (req ,res) => {
  const urlA = new URL(req.body.url)
  
  dns.lookup(urlA.hostname, (err, address) => {
    if (err && urlA.protocol != 'http:' && urlA.protocol != 'https:') { 
      res.status(400).json({error: 'invalid url'})
    }
    else {
      // Add url model to database
      const url = new Urls({ url: urlA.href, id: urlCount})
      urlCount++
      url.save( err => {
        if (err) console.error(err)
      })
      // Need to return res 
      return res.status(200).json({original_url: urlA.href, short_url: urlCount})
     }
  })
})

app.get('/api/shorturl/:id', async (req, res) => {
  const x = await Urls.find({ id:req.params.id })
  res.redirect(x[0].url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
