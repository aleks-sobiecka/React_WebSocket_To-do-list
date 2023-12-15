const express = require('express');
const socket = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const tasks = [];

// start server
const server = app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running...');
  });

//catch incorrect links
app.use((req, res) => {
    res.status(404).send({ message: 'Not found...' });
});

//integrate socket with server
const io = socket(server);

//listener on event connection
io.on('connection', (socket) => {
  //emitt tasks list to new user
  socket.emit('updateData', tasks);
  console.log('list updated');

  //listener on adding new task
  socket.on('addTask', (task) => {
    //add new task to the list
    tasks.push(task);
    //emitt added task to other sockets
    socket.broadcast.emit('addTask', task);
  });

  //listener on removing task
  socket.on('removeTask', (taskId) => {
    //delete task from list (find index/ filter)
    for (let task of tasks){
      if (task.id === taskId){
        const index = tasks.indexOf(task);
        tasks.splice(index,1);
        //emitt removed task to other sockets
        socket.broadcast.emit('removeTask', taskId);
      }
    }
  });

  //listener on editing task
  socket.on('editTask', taskData => {
    console.log('taskData: ', taskData)
    //change task name
    for (let task of tasks){
      if (task.id === taskData.id){
        task.name = taskData.name
        //emitt edit task to other sockets
        socket.broadcast.emit('editTask', taskData);
      }
    }

    /* const task = tasks.find(task => (task.id === taskData.id))
    if (task) {task.name = taskData.name}; */
  });
});


