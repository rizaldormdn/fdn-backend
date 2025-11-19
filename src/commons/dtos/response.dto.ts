export class ResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  constructor(success: boolean, message: string, data?: T, meta?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(message: string, data?: T, meta?: any): ResponseDto<T> {
    return new ResponseDto(true, message, data, meta);
  }

  static error<T>(message: string, data?: T): ResponseDto<T> {
    return new ResponseDto(false, message, data);
  }
}
