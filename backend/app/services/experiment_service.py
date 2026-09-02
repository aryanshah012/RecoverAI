import hashlib

def assign_variant(experiment_id:int, opportunity_id:str, split_a:float=.5):
    digest=hashlib.sha256(f"{experiment_id}:{opportunity_id}".encode()).hexdigest()
    bucket=int(digest[:8],16)/0xFFFFFFFF
    return "A" if bucket<split_a else "B"
