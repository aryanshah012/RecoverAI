from app.utils.money import rupees_to_paise,paise_to_rupees
def test_money():
    assert rupees_to_paise(899.99)==89999
    assert paise_to_rupees(89999)==899.99
