import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers["authorization"];

      if (!authHeader) {
        this.logger.warn("Authorization header is missing");
        throw new UnauthorizedException("Authorization header is required");
      }

      const expectedToken = this.configService.get<string>("DELETE_AUTH_TOKEN");

      if (authHeader !== expectedToken) {
        this.logger.warn("Invalid authorization token");
        throw new UnauthorizedException("Invalid authorization token");
      }

      return true;
    } catch (error) {
      this.logger.error(`Auth guard error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
