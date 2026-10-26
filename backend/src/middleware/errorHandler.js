const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[ 0 ];

    return res.status(409).json({
      status: "error",
      message: `${duplicateField} already exists`,
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;