class SocketIOResponse {
    constructor(code, message = null, data = null) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    static badRequest(message) {
        return new SocketIOResponse(400, message)
    }

    static internal(message) {
        return new SocketIOResponse(500, message)
    }

    static notFound(message) {
        return new SocketIOResponse(404, message)
    }

    static forbidden(message) {
        return new SocketIOResponse(403, message)
    }

    static response = 'response';
}

module.exports = SocketIOResponse;