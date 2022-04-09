
const { buildSchema, GraphQLSchema, GraphQLInt, GraphQLObjectType, 
        GraphQLString, GraphQLList, GraphQLInputObjectType } = require('graphql');
const fs = require('fs');
const { Buffer } = require('buffer');


let statuses;

function loadStatuses() {
  statuses = JSON.parse(fs.readFileSync('taskStatuses.json'));
}

loadStatuses();


const taskType = new GraphQLObjectType({
  name: 'Task',
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
    statusId: { type: GraphQLInt },
    completionDate: { type: GraphQLString },
    file: { type: GraphQLString }
  }
});


const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    statuses: {
      type: new GraphQLList(GraphQLString),
      resolve: onGetStatuses
    },
    tasks: {
      type: new GraphQLList(taskType),
      args: {
        filter: { type: GraphQLInt }
      },
      resolve: onGetTasks
    },
    taskFile: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: onGetTaskFile
    }
  }
});


const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    updateTask: {
      type: GraphQLInt,
      args: {
        receivedTask: { type: GraphQLString },
        file: { type: GraphQLString }
      },
      resolve: onUpdateTask
    },
    addTask: {
      type: GraphQLInt,
      args: {
        receivedTask: { type: GraphQLString },
        file: { type: GraphQLString }
      }
    }
  }
});


schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});



function onGetStatuses() {
  return statuses;
}


function onGetTasks(_, { filter }) {
  const rawTasks = fs.readFileSync('tasks.json');
  let tasks = JSON.parse(rawTasks);

  if (filter != null)
  {
    filter = Number(filter);
    tasks = tasks.filter(task => task.statusId === filter);
  }

  return tasks;
}


function onUpdateTask(_, { receivedTask, file }) {
  const rawTasks = fs.readFileSync('tasks.json');
  const tasks = JSON.parse(rawTasks);

  receivedTask = receivedTask.replace(/zxc/g, '"');

  receivedTask = JSON.parse(receivedTask);
  
  const taskId = receivedTask.id;
  
  const task = tasks.find(t => t.id === taskId);

  if (receivedTask.title != null) {
    task.title = receivedTask.title;
  }

  if (receivedTask.statusId != null) {
    task.statusId = receivedTask.statusId;
  }

  if (receivedTask.completionDate) {
    task.completionDate = receivedTask.completionDate;
  }
  else {
    task.completionDate = null;
  }

  if (receivedTask.file != null) {
    file = file.split(',')[1];

    const buff = Buffer.from(file, 'base64url');

    fs.writeFileSync(`Task files/${taskId}.bin`, buff);

    task.file = receivedTask.file;
  }
  else {
    try {
      fs.unlinkSync(`Task files/${taskId}.bin`);
    } catch(err) {
      // file didn't exist
    }

    task.file = null;
  }
  
  const writeData = JSON.stringify(tasks, null, 2);
  fs.writeFileSync('tasks.json', writeData);

  return null;
}


function onGetTaskFile(_, { id }) {
  const taskId = id;

  const rawTasks = fs.readFileSync('tasks.json');
  const tasks = JSON.parse(rawTasks);

  const task = tasks.find(t => t.id === taskId);

  const rawFile = fs.readFileSync(`Task files/${taskId}.bin`);

  return rawFile.toString('base64url');
}


module.exports = { 
  schema
};