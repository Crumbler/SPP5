
const { buildSchema } = require('graphql');


const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const roots = { 
  hello: () => 'Hello world!' 
};

module.exports = { 
  schema, 
  roots
};