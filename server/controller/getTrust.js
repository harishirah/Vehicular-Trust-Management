const sum = require("../utils/sum");

exports.get = async (req, res, next) => {
  try {
    const { a, b } = req.query;
    const out = sum(a, b);
    res.status(200).json({
      out: out,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
