require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('dns')
// Basic Configuration
const port = process.env.PORT || 3000;

// ------------------------ MONGO DB STUFF ----------------------------------------------
// MongoDB uri
const uri = 'mongodb+srv://devan:GWgJc5Uh9YP1lAH7@free-cc-cluster.dq2ed.mongodb.net/'
// Connect to mongodb with mongoose 
const db = mongoose.connect(uri, {useNewUrlParser:true, useUnifiedTopology: true})

// Create url schema 
const UrlSchema = mongoose.Schema({
  original_url: String,
  short_url: Number
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
  const url = new URL(req.body.url)

  dns.lookup(url.hostname, (err, address) => {

    if (err || ( url.protocol != 'http:' && url.protocol != 'https:' ) ) {
      res.json({error: 'invalid url'})
    }
    else {
      // Add url model to database
      const DBurl = new Urls({ original_url: url.href, short_url: urlCount})
      urlCount++
      DBurl.save( err => {
        if (err) console.error(err)
      })
      // Need to return res 
      res.json({original_url: url.href, short_url: urlCount})
     }
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {

  try{
    const x = await Urls.find({ short_url:req.params.short_url })
    res.redirect(x[0].original_url)
  
  } catch(e) { 
    console.error(e) 
    res.status(404).json({error: 'url not found'})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
