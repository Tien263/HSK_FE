import { PortalError } from "./portal-auth";
import { validDate } from "./schedule-core";
export function reportRange(request: Request){const params=new URL(request.url).searchParams;const from=params.get("from")||undefined,to=params.get("to")||undefined;if((from&&!validDate(from))||(to&&!validDate(to))||(from&&to&&to<from))throw new PortalError(400,"Khoảng thời gian báo cáo không hợp lệ.");return{from,to};}
