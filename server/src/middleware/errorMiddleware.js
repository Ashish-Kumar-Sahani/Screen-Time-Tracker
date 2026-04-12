const errorHandler =(err,req,res,next)=>{
    console.error("🔥 Error:", err.message);
    const statusCode =res.statusCode && res.statusCode !==2000 ? res.statusCode : 500;
    res.status(statusCode).json({
        success:false,
        message:err.message,
        ...(process.env.NODE_ENV === "development" && { stack:err.stack })
    });
};
module.exports = errorHandler;