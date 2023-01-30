const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwtSecret = "mysecret";
const saltRounds = 10;

// REGISTER
const register = async (req, res) => {
  const { username, password } = req.body;

  const hash = await bcrypt.hash(password, saltRounds);
  const createdUser = await prisma.user.create({
    data: {
      username,
      password: hash,
    },
  });

  res.json({ data: createdUser });
};

// LOGIN
const login = async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!foundUser) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const passwordsMatch = await bcrypt.compare(password, foundUser.password);

  if (!passwordsMatch) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign({ username }, jwtSecret);

  res.json(token);
};

module.exports = {
  register,
  login,
};
