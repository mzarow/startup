import {Get, JsonController} from "routing-controllers";
import {Service} from "typedi";

@Service()
@JsonController('/health')
export class HealthController {

  @Get('/_liveness')
  public liveness() {
    return { status: 'live' };
  }
}
