const notFound = (req, res) => {
    const statusCode = 404;
    res.status(statusCode).json({
        success: false,
        statusCode,
        data: { message: `Route not found: ${req.method} ${req.originalUrl}` },
        txId: req.id || 'unknown',
    });
};

export default notFound;
