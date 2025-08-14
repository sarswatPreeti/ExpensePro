// server/utils/issueJwt.js
const jwt = require("jsonwebtoken");

function issueJwt(firebaseDecodedToken) {
  return jwt.sign(
    {
      uid: firebaseDecodedToken.uid,
      email: firebaseDecodedToken.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = issueJwt;
