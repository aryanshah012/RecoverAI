# Evaluation

All included training and simulation data are synthetic.

## ML

- 80/20 held-out split
- ROC-AUC
- Precision
- Recall
- F1
- Brier score

## Business simulation

Benchmark sizes: 10K, 50K, 100K synthetic transactions. Suggested seeds: 42, 101, 202, 303, 404.

Primary metric: **Additional Net Recovered Revenue**.

Other metrics:
- recovered revenue
- recovery rate
- intervention cost
- non-converting interventions
- net recovered revenue

The baseline is a simple generic retry and does not receive customer memory, model scores, or agent strategy context.
