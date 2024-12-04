require('dotenv').config()
const PORT = process.env.PORT || 5000

const http = require('http');
const { Server } = require('socket.io');

const sequelize = require('./config/sequelize');
const initializeApp = require('./config/app')

const app = require('./app')
const server = http.createServer(app);
const io = new Server(server);
const chatSockets = require('./sockets/index')

initializeApp(sequelize);
chatSockets(io)

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
})