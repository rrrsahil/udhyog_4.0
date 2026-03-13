import pandas as pd
import numpy as np


# ======================================
# LOAD DATASET
# ======================================
def load_dataset(file_path):

    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)

    elif file_path.endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path)

    else:
        raise ValueError("Unsupported file format")

    df = df.dropna()
    df.columns = df.columns.str.strip()

    return df


# ======================================
# COMPUTE RANGES
# ======================================
def compute_ranges(series):

    min_val = series.min()
    max_val = series.max()

    interval = (max_val - min_val) / 4

    r1 = (min_val, min_val + interval)
    r2 = (min_val + interval, min_val + 2 * interval)
    r3 = (min_val + 2 * interval, min_val + 3 * interval)
    r4 = (min_val + 3 * interval, max_val)

    return [r1, r2, r3, r4]


# ======================================
# LOCAL PROBABILITY
# ======================================
def compute_local_probability(df, column, value_range):

    low, high = value_range

    count = df[(df[column] >= low) & (df[column] <= high)].shape[0]

    return count / len(df)


# ======================================
# PRIOR ODDS
# ======================================
def compute_prior_odds(lp):

    if lp == 1:
        return 0

    return lp / (1 - lp)


# ======================================
# JOINT PROBABILITY
# ======================================
def compute_joint_probability(df, input_col, input_range, target_col, target_range):

    low, high = input_range
    t_low, t_high = target_range

    subset = df[
        (df[input_col] >= low) &
        (df[input_col] <= high) &
        (df[target_col] >= t_low) &
        (df[target_col] <= t_high)
    ]

    return len(subset) / len(df)


# ======================================
# CONDITIONAL PROBABILITY
# ======================================
def compute_conditional_probability(df, input_col, input_range, target_col, target_range, lp):

    jp = compute_joint_probability(df, input_col, input_range, target_col, target_range)

    t_low, t_high = target_range

    target_count = df[
        (df[target_col] >= t_low) &
        (df[target_col] <= t_high)
    ].shape[0]

    p_target = target_count / len(df)

    if lp == 0:
        return 0

    return (jp * p_target) / lp


# ======================================
# LIKELIHOOD RATIO
# ======================================
def compute_likelihood_ratio(cp):

    if cp == 1:
        return 0

    return cp / (1 - cp)


# ======================================
# POSTERIOR ODDS
# ======================================
def compute_posterior_odds(prior_odds, lr):

    return prior_odds * lr


# ======================================
# POSTERIOR PROBABILITY
# ======================================
def compute_posterior_probability(posterior_odds):

    return posterior_odds / (1 + posterior_odds)


# ======================================
# SEVERITY LEVEL
# ======================================
def severity_level(prob):

    if prob < 0.06:
        return "Very Low"

    elif prob < 0.3:
        return "Low"

    elif prob < 0.7:
        return "High"

    else:
        return "Very High"


# ======================================
# PARAMETER SEVERITY MATRIX
# ======================================
def build_severity_matrix(results):

    matrix = {}

    for r in results:

        param = r["parameter"]
        prop = r["property"]

        if param not in matrix:
            matrix[param] = {}

        matrix[param][prop] = r["severity"]

    return matrix


# ======================================
# DASHBOARD DATA
# ======================================
def build_dashboard_data(results):

    severity_counts = {
        "Very Low": 0,
        "Low": 0,
        "High": 0,
        "Very High": 0
    }

    for r in results:
        severity_counts[r["severity"]] += 1

    # Top parameters
    sorted_results = sorted(
        results,
        key=lambda x: x["posterior_probability"],
        reverse=True
    )

    top_parameters = sorted_results[:10]

    return {
        "severity_distribution": severity_counts,
        "top_parameters": top_parameters
    }


# ======================================
# MAIN MECHANICAL ANALYSIS
# ======================================
def run_mechanical_analysis(file_path):

    df = load_dataset(file_path)

    heat_column = df.columns[0]

    # Mechanical Properties (Targets)
    targets = ["UTS", "YS", "ELOG", "Hardness", "RA"]

    # Detect available targets
    targets = [t for t in targets if t in df.columns]

    # Input Parameters
    input_columns = [c for c in df.columns if c not in targets and c != heat_column]

    # Ensure numeric inputs
    df[input_columns] = df[input_columns].apply(
        pd.to_numeric, errors="coerce"
    ).fillna(0)

    results = []

    for param in input_columns:

        param_ranges = compute_ranges(df[param])

        for r in param_ranges:

            lp = compute_local_probability(df, param, r)

            prior_odds = compute_prior_odds(lp)

            for target in targets:

                target_ranges = compute_ranges(df[target])

                for tr in target_ranges:

                    cp = compute_conditional_probability(
                        df,
                        param,
                        r,
                        target,
                        tr,
                        lp
                    )

                    lr = compute_likelihood_ratio(cp)

                    post_odds = compute_posterior_odds(prior_odds, lr)

                    posterior = compute_posterior_probability(post_odds)

                    result = {

                        "parameter": param,
                        "range": f"{round(r[0],4)} - {round(r[1],4)}",
                        "property": target,
                        "target_range": f"{round(tr[0],4)} - {round(tr[1],4)}",
                        "local_probability": round(lp,4),
                        "prior_odds": round(prior_odds,4),
                        "conditional_probability": round(cp,4),
                        "likelihood_ratio": round(lr,4),
                        "posterior_odds": round(post_odds,4),
                        "posterior_probability": round(posterior,4),
                        "severity": severity_level(posterior)

                    }

                    results.append(result)

    # ======================================
    # CRITICAL PARAMETERS
    # ======================================
    critical_parameters = [
        r for r in results
        if r["posterior_probability"] > 0.5
    ]

    # ======================================
    # SEVERITY MATRIX
    # ======================================
    severity_matrix = build_severity_matrix(results)

    # ======================================
    # DASHBOARD DATA
    # ======================================
    dashboard_data = build_dashboard_data(results)

    return {

        "mechanical_results": results,

        "critical_parameters": critical_parameters,

        "parameter_severity_matrix": severity_matrix,

        "dashboard_data": dashboard_data

    }