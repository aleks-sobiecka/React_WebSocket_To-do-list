import io from 'socket.io-client';
import { useState } from 'react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';


const App = () => {

  const [socket, setSocket] = useState();
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskToEdit, setTaskToEdit] = useState(null);

  //console.log('actual tasks: ', tasks);
  
  useEffect(() => {
      const socket = io('ws://localhost:8000', { transports: ["websocket"] });;
      setSocket(socket);

      socket.on('updateData', (tasks) => {updateTasks(tasks)});
      socket.on('removeTask', (taskId) => {removeTask(taskId)});
      socket.on('addTask', (task) => {addTask(task)});
      socket.on('editTask', (task) => {editTask(undefined, task)});
  
      return () => {
        socket.disconnect();
      };
  }, []);

  const removeTask = (taskId, onClient) => {
    setTasks(tasks => tasks.filter(task => task.id !== taskId))
    if (onClient) socket.emit('removeTask', taskId);
    console.log('task removed');
  };

  const addTask = (task) => {
    setTasks(tasks => [...tasks, task]);
    setTaskName('');
    }

  const updateTasks = (tasksData) => {
    setTasks(tasksData);
    console.log('list updated');
  };
  
  const submitForm = e => {
    e.preventDefault();
    const task = {name: taskName, id: uuidv4()};
    addTask(task);
    socket.emit('addTask', task);
  };

  const showEdit = (e, taskId) => {
    e.preventDefault();
    setTaskToEdit(taskId);
  }

  const editTask = (e, taskData, onClient) => {
    console.log(taskData);
    console.log(tasks);
    if (e) e.preventDefault();
    setTasks(tasks => tasks.map(task => (task.id === taskData.id ? {...task, name: taskData.name} : task)));
    if (onClient) socket.emit('editTask', (taskData));

    setTaskName('');
    setTaskToEdit(null);
  }

  return (
    <div className="App">

      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            < li key={task.id}>
              <div className={`"task " + ${taskToEdit === task.id ? "hide" : null}`}>
                {task.name}
                <button className="btn btn--green" onClick={(e) => showEdit(e, task.id)}>Edit</button>
                <button className="btn btn--red" onClick={() => removeTask(task.id, true)}>Remove</button>
              </div>

              <div>
                <form id="add-task-form" className={taskToEdit !== task.id ? "hide" : null} onSubmit={(e) => editTask(e, {id: task.id, name: taskName}, true)}>
                  <input className="text-input" autoComplete="off" type="text" placeholder={task.name} id="task-name" value={taskName} onChange={(e)=> setTaskName(e.target.value)}/>
                  <button className="btn" type="submit">Change</button>
                </form>
            </div>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={(e) => submitForm(e)} >
          <input className="text-input" autoComplete="off" type="text" placeholder="Type your description" id="task-name" value={taskToEdit === null ?  (taskName) : ''} onChange={(e) => setTaskName(e.target.value)} />
          <button className="btn" type="submit">Add</button>
        </form>

      </section>
    </div>
  );
}

export default App;