
const { buildSchema } = require('graphql');
const fs = require('fs');


let statuses;

function loadStatuses() {
  statuses = JSON.parse(fs.readFileSync('taskStatuses.json'));
}


loadStatuses();


const schema = buildSchema(`
  type Query {
    statuses: [String]
  }
`);


const roots = { 
  statuses: onGetStatuses
};


function onGetStatuses() {
  return statuses;
}


module.exports = { 
  schema, 
  roots
};