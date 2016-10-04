'use strict';

const socket = io()

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log(`Socket connected`))

const boardState = [
  ['','',''],
  ['','',''],
  ['','',''],
]

const drawBoard = (boardState) => {
  document.querySelector('.board').innerHTML = `
  <table>
    <tr>
      <td>${boardState[0][0]}</td>
      <td>${boardState[0][1]}</td>
      <td>${boardState[0][2]}</td>
    </tr>
    <tr>
      <td>${boardState[1][0]}</td>
      <td>${boardState[1][1]}</td>
      <td>${boardState[1][2]}</td>
    </tr>
    <tr>
      <td>${boardState[2][0]}</td>
      <td>${boardState[2][1]}</td>
      <td>${boardState[2][2]}</td>
    </tr>
  </table
  `
}
drawBoard(boardState)
let nextPlayer = "O"
const board = document.querySelector('.board')

board.addEventListener('click', event => {
  const column = event.target.cellIndex
  const row = event.target.closest('tr').rowIndex
  if (boardState[row][column]){
    return console.log("Cannot move there")
  }
  boardState[row][column] = nextPlayer
  nextPlayer = nextPlayer === "X" ? "O" : "X"
  drawBoard(boardState)
  // event.target.innerText = "X"
  console.log(`Current game state:`, board)

})