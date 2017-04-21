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
    getPosts(subreddit, "Hot", (resData) => {
      res.send(resData)
    })
  }

  if (action === "getHot.getHot-next") {
    let contexts = req.body.result.contexts,
        subreddit =  contexts.find((d) => {
          return d.name == "subreddit"
        }).parameters.subreddit
      axios.get("https://www.reddit.com/r/" + subreddit + ".json")
      .then((resp) => {
        let posts = resp.data.data.children
        let lim = 5
        let count = 0
        let titles = []
        Object.keys(posts).forEach((x) => {
          let n = parseInt(x) + 5
          titles.push([parseInt(x) + 6]+": "+posts[n].data.title + ".\n")
          count++
          if (count == lim) {
            let speech = "Here are the next 5 hot posts in " + subreddit + ".\n " + titles.toString().replace(/,/g, "")
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

  if (action === "getNew") {
    let subreddit = params.subreddit

      axios.get("https://www.reddit.com/r/" + subreddit + "/new.json")
      .then((resp) => {
        let posts = resp.data.data.children
        let lim = 5
        let count = 0
        let titles = []
        Object.keys(posts).forEach((x) => {
          titles.push([parseInt(x) + 1]+": "+posts[x].data.title + ".\n")
          count++
          if (count == lim) {
            let speech = "Here are the new posts in " + subreddit + ".\n " + titles.toString().replace(/,/g, "")
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

  if (action === "getTop") {
    let subreddit = params.subreddit

      axios.get("https://www.reddit.com/r/" + subreddit + "/top.json")
      .then((resp) => {
        let posts = resp.data.data.children
        let lim = 5
        let count = 0
        let titles = []
        Object.keys(posts).forEach((x) => {
          titles.push([parseInt(x) + 1]+": "+posts[x].data.title + ".\n")
          count++
          if (count == lim) {
            let speech = "Here are the top posts in " + subreddit + ".\n " + titles.toString().replace(/,/g, "")
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

})

const getPosts = (subreddit, sort, callback) => {
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
        let speech = "Here are the " + sort + " posts in " + subreddit + ".\n " + titles.toString().replace(/,/g, "")
        let resData = {
          speech: speech,
          displayText: speech
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