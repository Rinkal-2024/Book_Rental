class ApiResponse {
  constructor(statusCode, data = null, message = 'Success', success = true) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message, true);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message, true);
  }

  static paginated(data, pagination, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, {
      items: data,
      pagination
    }, message, true);
  }

  static error(statusCode, message, data = null) {
    return new ApiResponse(statusCode, data, message, false);
  }
}

export default ApiResponse;
