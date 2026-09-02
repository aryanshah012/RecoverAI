from app.services.experiment_service import assign_variant
def test_assignment_stable(): assert assign_variant(1,"x")==assign_variant(1,"x")
