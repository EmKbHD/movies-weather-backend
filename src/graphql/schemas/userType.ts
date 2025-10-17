export const userType = `
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    city: String!
    createdAt: String!
    updatedAt: String!
    favorites:[Movie!]
  }

  type Query {
    me: User
    users: [User!]!
    getUserProfile: User!
  }

  input SignUpInput {
    firstName: String!
    lastName: String!
    email: String!
    city: String!
    password: String!
  }

  input LogInInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    email: String
    city: String
  }

  input UpdatePasswordInput {
    currentPassword:String!
    newPassword:String!
    confirmNewPassword:String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    signup(input: SignUpInput!): AuthPayload!
    login(input: LogInInput!): AuthPayload!
    logout: Boolean!
    updateProfile(input: UpdateProfileInput!): User!
    updatePassword(input: UpdatePasswordInput!): SuccessResponse!
  }
`;
