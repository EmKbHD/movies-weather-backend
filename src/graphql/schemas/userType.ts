export const userType = `
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    city: String
  }

  type Query {
    me: User
  }

  input SignupInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    city: String!
  }

  input LogInInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(input: LogInInput): AuthPayload!
    logout: Boolean!
  }
`;
