from decimal import Decimal, ROUND_HALF_UP

def rupees_to_paise(value: float | Decimal) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

def paise_to_rupees(value: int) -> float:
    return float(Decimal(value) / Decimal(100))
