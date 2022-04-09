
const { buildSchema } = require('graphql');
const fs = require('fs');


let statuses;

function loadStatuses() {
  statuses = JSON.parse(fs.readFileSync('taskStatuses.json'));
}

loadStatuses();


const schema = buildSchema(`
  type Task {
    title: String!
    id: Int!
    statusId: Int!
    completionDate: String
    file: String
  }

  type Query {
    statuses: [String!]!
    tasks(filter: Int): [Task!]!
  }
`);


const roots = { 
  statuses: onGetStatuses,
  tasks: onGetTasks
};


function onGetStatuses() {
  return statuses;
}


function onGetTasks({ filter }) {
  const rawTasks = fs.readFileSync('tasks.json');
  let tasks = JSON.parse(rawTasks);

  if (filter != null)
  {
    filter = Number(filter);
    tasks = tasks.filter(task => task.statusId === filter);
  }

  return tasks;
}


module.exports = { 
  schema, 
  roots
};