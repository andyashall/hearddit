'use strict'

const path = require('path')
const express = require('express')

const isDeveloping = process.env.NODE_ENV !== 'production'
const port = isDeveloping ? 3000 : process.env.PORT
const app = express()

const randomID = require('random-id')
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const url = process.env.MONGO_URL

app.post('/webhook', (req, res) => {

  if (!req.body.result.action) {
    res.send("Not Authorized")
    return
  }

  let action = req.body.result.action,
      sid = req.body.sessionId,
      params = req.body.result.parameters

  console.log("Request Time: " + req.body.timestamp)
  console.log("Session ID: " + sid)
  console.log("Request Type: " + action)
  console.log("Params: " + params)

  // Actions

  let act = "sayFeedback"

  if (!req.body.result.contexts) {
    act = "sayName"
  }

  if (act === "sayName") {
    let name = params.name
      let resData = {
        speech: "Hi " + name + ", what would you like to say?",
        displayText: "Hi " + name + ", what would you like to say?",
        data: {},
        contextOut: [{name:"name", lifespan:120, parameters: {name: name}}],
        source: "",
        followupEvent: {}
      }
    res.send(resData)
    return 
  }

  if (act === "sayFeedback") {
    let feedback = params.feedback,
        contexts = req.body.result.contexts,
        name =  contexts.find((d) => {
        return d.name == "name"
      }).parameters.name
      console.log(name + " " + feedback)
      let resData = {
        speech: "Thanks for you feedback!",
        displayText: "Thanks for you feedback!",
        data: {},
        source: "",
        followupEvent: {}
      }
    res.send(resData)
    return 
  }

})

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('==> 🌎 Listening on port %s.', port, port)
})