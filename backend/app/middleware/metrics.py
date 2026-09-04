import time
from collections import Counter
from threading import Lock
from starlette.middleware.base import BaseHTTPMiddleware

class ApiMetrics:
    def __init__(self):
        self.started_at=time.time(); self.requests=Counter(); self.total_latency_ms=Counter(); self._lock=Lock()
    def record(self,method,path,status,elapsed_ms):
        key=f"{method} {path} {status}"
        with self._lock: self.requests[key]+=1; self.total_latency_ms[key]+=elapsed_ms
    def snapshot(self):
        with self._lock:
            routes=[{"route":key,"requests":count,"average_latency_ms":round(self.total_latency_ms[key]/count,2)} for key,count in self.requests.items()]
        return {"uptime_seconds":round(time.time()-self.started_at),"request_count":sum(self.requests.values()),"routes":sorted(routes,key=lambda x:x["requests"],reverse=True)[:30]}

api_metrics=ApiMetrics()

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self,request,call_next):
        started=time.perf_counter(); response=await call_next(request)
        path=request.scope.get("route").path if request.scope.get("route") else request.url.path
        api_metrics.record(request.method,path,response.status_code,(time.perf_counter()-started)*1000)
        response.headers["Server-Timing"]=f'app;dur={(time.perf_counter()-started)*1000:.2f}'
        return response
