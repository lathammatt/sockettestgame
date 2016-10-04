'use strict';

const socket = io()

socket.on('connect', () => console.log(`Socket connected: ${socket.id}`))
socket.on('disconnect', () => console.log(`Socket connected`))

const table = document.querySelector('table')
table.addEventListener('click', event => {
  console.log(event.target)
})