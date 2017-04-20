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
const axios = require('axios')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const url = process.env.MONGO_URL

app.post('/webhook', (req, res) => {

  if (req.headers.pass !== "sFCu8YTZodeFylBqKari") {
    res.send("Not Authorized")
    console.log("Unautharized attempt")
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

  if (action === "input.welcome") {
      let resData = {
        speech: "Hi",
        displayText: "Hi"
      }
    res.send(resData)
    return 
  }

  if (action === "getHot") {
    let subreddit = params.subreddit

      axios.get("https://www.reddit.com/r/" + subreddit + ".json")
      .then((resp) => {
        let posts = resp.data.data.children
        let lim = 5
        let count = 0
        let titles = []
        Object.keys(posts).forEach((x) => {
          titles.push([parseInt(x) + 1]+": "+posts[x].data.title + ".\n")
          count++
          if (count == lim) {
            let speech = titles.toString().replace(/,/g, "")
            let resData = {
              speech: speech,
              displayText: speech
            }
            res.send(resData)
            return
          }
        })
      })
      .catch((err) => {
        console.log(err)
        res.send(err)
      }) 
  }

  if (action === "sayFeedback") {
    let feedback = params.feedback,
        contexts = req.body.result.contexts,
        name =  contexts.find((d) => {
        return d.name == "name"
      }).parameters.name,
        lastname =  contexts.find((d) => {
        return d.name == "name"
      }).parameters.lastname
      console.log(name + " " + lastname + ": " + feedback)
      MongoClient.connect(url)
      .then((db,err) => {
        assert.equal(null,err)
        let Feedback = db.collection('holding')
        Feedback.insert({
          name: name + " " + lastname,
          feedback: feedback,
          created: new Date(),
          _id: randomID(20)
        }, (err, result) => {
          if (err) {
          let resData = {
            speech: "Error inserting feedback!",
            displayText: "Error inserting feedback!",
            data: {},
            source: "",
            followupEvent: {}
          }
          res.send(resData)
          }
          if (result) {
          let resData = {
            speech: "Thank you for your feedback!",
            displayText: "Thank you for your feedback!",
            data: {},
            source: "",
            followupEvent: {}
          }
          res.send(resData)
          }
        })
      })

    return 
  }

})

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('==> 🌎 Listening on port %s.', port, port)
})