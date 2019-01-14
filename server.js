const express = require('express')
const router = express.Router()
// const morgan = require('morgan')
const bodyParser = require('body-parser')

const {BlogPosts} = require('./models')

const jsonParser = bodyParser.json()
const app = express()

// applicationCache.use(morgan('common'))

// Creating some blog posts so there's something to GET
BlogPosts.create('The World\'s Oceans', 'There are five of them', 'D.R.', '01-05-2019')

app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get())
})

app.post('/blog-posts', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['title', 'content', 'author', 'publishDate']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i]
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message)
      return res.status(400).send(message)
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate)
  res.status(201).json(item)
})

app.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id)
  console.log(`Deleted blog post \`${req.params.id}\``)
  res.status(204).end()
})

app.put('/blog-posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['id', 'title', 'content', 'author', 'publishDate']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i]
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message)
      return res.status(400).send(message)
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`
    console.error(message)
    return res.status(400).send(message)
  }
  console.log(`Updating blog post \`${req.params.id}\``)
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  })
  res.status(204).end()
})

let server

function runServer() {
  const port = process.env.PORT || 8080
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`)
        resolve(server)
      })
      .on("error", err => {
        reject(err)
      })
  })
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server")
    server.close(err => {
      if (err) {
        reject(err)
        // so we don't also call `resolve()`
        return
      }
      resolve()
    })
  })
}


if (require.main === module) {
  runServer().catch(err => console.error(err))
}

// CAUSES NODEMON TO CRASH:
/* 
events.js:167
      throw er; // Unhandled 'error' event
      ^
Error: listen EADDRINUSE: address already in use :::8080
    at Server.setupListenHandle [as _listen2] (net.js:1290:14)
    at listenInCluster (net.js:1338:12)
    at Server.listen (net.js:1425:7)
    at Function.listen (C:\Dan\Business\Coding\Thinkful\server-side-js\challenge-blog-api\node_modules\express\lib\application.js:618:24)
    at Object.<anonymous> (C:\Dan\Business\Coding\Thinkful\server-side-js\challenge-blog-api\server.js:103:5)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
Emitted 'error' event at:
    at emitErrorNT (net.js:1317:8)
    at process._tickCallback (internal/process/next_tick.js:63:19)
    at Function.Module.runMain (internal/modules/cjs/loader.js:745:11)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)
*/

module.exports = { app, runServer, closeServer }

// THIS LINE NO LONGER NEEDED
/* app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`)
}) */