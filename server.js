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
        speech: "Hi!",
        displayText: "Hi!"
      }
    res.send(resData)
    return 
  }

  if (action === "getHot") {
    let subreddit = params.subreddit
    getPosts(subreddit, "Hot", 0, (resData) => {
      res.send(resData)
    })
  }

  if (action === "getHot.getHot-next") {
    let contexts = req.body.result.contexts,
        subreddit =  contexts.find((d) => {
          return d.name == "subreddit"
        }).parameters.subreddit,
        page = contexts.find((d) => {
          return d.name == "page"
        }).parameters.page
    getPosts(subreddit, "Hot", page, (resData) => {
      res.send(resData)
    })     
  }

  if (action === "getNew") {
    let subreddit = params.subreddit
    getPosts(subreddit, "New", 0, (resData) => {
      res.send(resData)
    })
  }

  if (action === "getTop") {
    let subreddit = params.subreddit
    getPosts(subreddit, "Top", 0, (resData) => {
      res.send(resData)
    })
  }

})

const getPosts = (subreddit, sort, page, callback) => {
  let skip = 0
  if (page === 1) {
    skip = 5
  }
  if (page === 2) {
    skip = 10
  }
  if (page === 3) {
    skip = 15
  }
  axios.get("https://www.reddit.com/r/" + subreddit + ".json")
  .then((resp) => {
    let posts = resp.data.data.children
    let lim = 5
    let count = 0
    let titles = []
    Object.keys(posts).forEach((x) => {
      let n = parseInt(x) + skip
      titles.push([parseInt(n) + 1]+": "+posts[n].data.title + ".\n")
      count++
      if (count == lim) {
        let speech = "Here are the " + sort + " posts in " + subreddit + ".\n " + titles.toString().replace(/,/g, "")
        let resData = {
          speech: speech,
          displayText: speech,
          contextOut: [{name:"page", lifespan:5, parameters: {page: page + 1}}],
        }
        callback(resData)
        return
      }
    })
  })
  .catch((err) => {
    console.log(err)
    res.send(err)
  })
}

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('==> 🌎 Listening on port %s.', port, port)
})