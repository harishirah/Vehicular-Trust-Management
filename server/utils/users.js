const EthCrypto = require("eth-crypto");
const dotenv = require("dotenv");
dotenv.config();
const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return { error: "Username and Room are required!" };
  }

  // Check the existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //   check for already existing session keys
  if (process.env["SK_" + room] === undefined) {
    // If not present generate a pair
    const sessionKeys = EthCrypto.createIdentity();
    process.env["SK_" + room] = sessionKeys.privateKey;
    process.env["PK_" + room] = sessionKeys.publicKey;
  }
  // Validating username
  if (existingUser) {
    return { error: "Username is in use !" };
  }

  // Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  let removedUser;
  if (index !== -1) {
    removedUser = users.splice(index, 1)[0];
    const usersInTheSameRoom = users.findIndex(
      (user) => user.room === removedUser.room
    );
    if (usersInTheSameRoom === -1) {
      if (process.env["SK_" + removedUser.room])
        delete process.env["SK_" + removedUser.room];
      if (process.env["PK_" + removedUser.room])
        delete process.env["PK_" + removedUser.room];
    }
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
