from datetime import datetime, timedelta

def choose_best_recovery_time(best_hour:int|None, failure_reason:str):
    now=datetime.utcnow()
    if failure_reason=="network_error": return now+timedelta(minutes=30)
    if failure_reason=="insufficient_funds": return now+timedelta(hours=6)
    if best_hour is None: return now+timedelta(hours=2)
    candidate=now.replace(hour=best_hour,minute=0,second=0,microsecond=0)
    if candidate<=now: candidate+=timedelta(days=1)
    return candidate
