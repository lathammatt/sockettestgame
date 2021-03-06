'use strict';

const express = require('express')
const { Server } = require('http')
const mongoose = require('mongoose')
const socketio = require('socket.io')

const app = express()
const server = Server(app)
const io = socketio(server)

const PORT = process.env.PORT || 7575
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/ticktackdoh'

app.set('view engine', 'pug')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('home')
})
app.get('/game', (req, res) => {
  Game.find()
    .then(games => res.render('index', { games }))
})
app.get('/game/create', (req, res) => {
  Game.create({
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      toMove: 'X',
    })
    .then(game => res.redirect(`/game/${game._id}`))
})
app.get('/game/:id', (req, res) => {
  res.render('game')
})


mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
})

const Game = mongoose.model('game', {
  board: [
    [String, String, String],
    [String, String, String],
    [String, String, String],
  ],
  toMove: String,
  result: String,
})

io.on('connect', socket => {
  const id = socket.handshake.headers.referer.split('/').slice(-1)[0]

  Game.findById(id)
    .then(g => {
      socket.join(g._id)
      socket.gameID = g._id
      socket.emit('new game', g)
    })
    .catch(err => {
      socket.emit('error', err)
      console.error(err)
    })
  console.log(`Socket connected: ${socket.id}`)

  socket.on('make move', move => makeMove(move, socket))
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`))
})

const makeMove = (move, socket) => {
  Game.findById(socket.gameID)
    .then(game => {
      if (isFinished(game) || !isSpaceAvailable(game, move)) {
        return
      }
      return game
    })
  // Promise.resolve() //have to put promise around returned object in order to do the .then-chain below with setMove
    .then(g => setMove(g, move))
    .then(toggleNextMove)
    .then(setResult)
    .then(g => g.save())
    .then(g => io.to(g._id).emit('move made', g))
    .catch(console.error)
}

const isFinished = game => !!game.result //will return true, or else return false

const isSpaceAvailable = (game, move) => !game.board[move.row][move.col]

const setMove = (game, move) => {
  game.board[move.row][move.col] = game.toMove
  game.markModified('board') //will let mongoose know that the board property has been modified because mongoose still thinks each game state change is the same array and will update with blanks
  return game
}

const toggleNextMove = game => {
  game.toMove = game.toMove === 'X' ? 'O' : 'X'
  return game
}

const setResult = game => {
  const result = winner(game.board)
  if (result) {
    game.toMove = undefined // how to delete a property in mongoose
    game.result = result
  }
  return game
}

const winner = b => {
  // Rows
  if (b[0][0] && b[0][0] === b[0][1] && b[0][1] === b[0][2]) {
    return b[0][0]
  }

  if (b[1][0] && b[1][0] === b[1][1] && b[1][1] === b[1][2]) {
    return b[1][0]
  }

  if (b[2][0] && b[2][0] === b[2][1] && b[2][1] === b[2][2]) {
    return b[2][0]
  }

  // Cols
  if (b[0][0] && b[0][0] === b[1][0] && b[1][0] === b[2][0]) {
    return b[0][0]
  }

  if (b[0][1] && b[0][1] === b[1][1] && b[1][1] === b[2][1]) {
    return b[0][1]
  }

  if (b[0][2] && b[0][2] === b[1][2] && b[1][2] === b[2][2]) {
    return b[0][2]
  }

  // Diags
  if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
    return b[0][0]
  }

  if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
    return b[0][2]
  }

  // Tie
  if (!movesRemaining(b)) {
    return 'Tie'
  }

  //or In-Progress
  return null

}

const movesRemaining = (board) => {
  const possiblemoves = 9
  const movesMade = flatten(board).join('').length
  return possiblemoves - movesMade
}

const flatten = array =>
  array.reduce((a, b) => a.concat(b))