'use strict';

const socket = io()

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log(`Socket connected`))

const board = [
  [,,],
  [,,],
  [,,],
]

const table = document.querySelector('table')

table.addEventListener('click', event => {
  const column = event.target.cellIndex
  const row = event.target.parentElement.rowIndex
  board[row][column] = "O"
  event.target.innerText = "X"
  console.log(`Current game state:`, board)

})