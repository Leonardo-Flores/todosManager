const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user){
    return response.status(400).json({error: "Usuário não existe"})
  }

  request.user = user;
  

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const todos = []

  const checkUserExists = users.some((user) => user.username === username)

  if (checkUserExists){
    return response.status(400).json({error: "Usuário já existe"})
  }
const user = {
  id: uuidv4(),
  name,
  username,
  todos
}

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const formattedDeadLine = new Date(deadline)

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: formattedDeadLine,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline} = request.body

  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({error: "This to-do does not exists"})    
  }else{
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.json(todo)
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find((todo) => todo.id === id)

  if (todo) {
    todo.done = true;
    return response.json(todo)
  }else{
    return response.status(404).json({error: "This to-do does not exists"})
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id)
  if (!todo){
    return response.status(404).json({error: "This to-do does not exists"})
  }else{
    user.todos.splice(todo, 1);
    return response.status(204).send()
  }
});

module.exports = app;