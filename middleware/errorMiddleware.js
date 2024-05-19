//function that can be executed between request and response cycle

const errorHandler = (err, req, res, next) => {

    const statusCode = res.statusCode ? res.statusCode : 500
    res.status(statusCode)
    
    res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null
    })
};

module.exports = errorHandler;

//TODO: xem lỗi crash const statusCode = res.statusCode ? res.statusCode : 500
//TypeError: Cannot read properties of undefined (reading 'statusCode')