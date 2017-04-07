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

// Login
  if (action === "sayName") {
    let name = params.name
      let resData = {
        speech: "Hi" + name + ", what would you like to say?",
        displayText: "Hi" + name + ", what would you like to say?",
        data: {},
        contextOut: [{name:"name", lifespan:120, parameters: {name: name}}],
        source: "",
        followupEvent: {}
      }
    res.send(resData)
    return 
  }

// Open specified meeting
  if (action === "openMeeting") {
    let contexts = req.body.result.contexts
    let n = params.meetingNumber
    let uid =  contexts.find((d) => {
        return d.name == "userid"
      }).parameters.userId
    if (uid !== null) {
      getMeetingId(uid, n, (data, err) => {
        if (data == "error") {
          let resData = {
            speech: "Error creating meeting",
            displayText: "Error creating meeting",
            data: {},
            contextOut: [],
            source: "",
            followupEvent: {}
          }
          res.send(resData);
          return         
        } else {
        let mid = data[0]._id
        let mt = data[0].title
        console.log(data)
        var tasks = [];    
        let resData = {
          speech: "Meeting opened: " + mt,
          displayText: "Meeting opened: " + mt,
          data: {},
          contextOut: [{name:"meetingId", lifespan:120, parameters: {meetingId: mid}}],
          source: "",
          followupEvent: {}
        }
        res.send(resData)
        return
      }
      })
    } else {
      let resData = {
        speech: "Please login to see your meeting",
        displayText: "Please login to see your meeting",
        data: {},
        contextOut: [],
        source: "",
        followupEvent: {}
      }
      res.send(resData)
      return     
    }
  }
})

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('==> 🌎 Listening on port %s.', port, port)
})