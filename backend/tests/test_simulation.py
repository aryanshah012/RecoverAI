from app.services.simulation_service import generate_simulation_data,run_baseline,run_recoverai
def test_simulation_reproducible():
    df=generate_simulation_data(1000,42)
    assert run_baseline(df,42)==run_baseline(df,42)
    assert run_recoverai(df,42)==run_recoverai(df,42)
