import pandas as pd
import numpy as np
import logging

# ================= LOGGING =================
logging.basicConfig(level=logging.INFO)

# ================= LOAD DATASET =================
def load_dataset(file_path):

    logging.info(f"Loading dataset: {file_path}")

    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)

    elif file_path.endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path)

    else:
        raise ValueError("Unsupported dataset format")

    df = df.dropna()
    df.columns = df.columns.str.strip()

    logging.info(f"Dataset loaded successfully with {len(df)} rows")

    return df


# ================= COMPUTE RANGES =================
def compute_parameter_ranges(df, input_columns):

    ranges = {}

    for col in input_columns:

        min_val = df[col].min()
        max_val = df[col].max()

        interval = (max_val - min_val) / 5

        r1 = (min_val, min_val + interval)
        r2 = (min_val + interval, min_val + 2 * interval)
        r3 = (min_val + 2 * interval, min_val + 3 * interval)
        r4 = (min_val + 3 * interval, min_val + 4 * interval)
        r5 = (min_val + 4 * interval, max_val)

        ranges[col] = [r1, r2, r3, r4, r5]

    return ranges


# ================= LOCAL PROBABILITY =================
def compute_local_probability(df, col, value_range):

    low, high = value_range

    count = df[(df[col] >= low) & (df[col] <= high)].shape[0]

    if len(df) == 0:
        return 0

    return count / len(df)


# ================= PRIOR ODDS =================
def compute_prior_odds(lp):

    if lp == 1:
        return 0

    return lp / (1 - lp)


# ================= JOINT PROBABILITY =================
def compute_joint_probability(df, col, value_range, defect_col):

    low, high = value_range

    subset = df[
        (df[col] >= low) &
        (df[col] <= high) &
        (df[defect_col] == 1)
    ]

    if len(df) == 0:
        return 0

    return len(subset) / len(df)


# ================= CONDITIONAL PROBABILITY =================
def compute_conditional_probability(df, col, value_range, defect_col, lp):

    jp = compute_joint_probability(df, col, value_range, defect_col)

    defect_total = df[df[defect_col] == 1].shape[0]

    if len(df) == 0 or lp == 0:
        return 0

    p_defect = defect_total / len(df)

    return (jp * p_defect) / lp


# ================= LIKELIHOOD RATIO =================
def compute_likelihood_ratio(cp):

    if cp == 1:
        return 0

    return cp / (1 - cp)


# ================= POSTERIOR ODDS =================
def compute_posterior_odds(prior_odds, lr):

    return prior_odds * lr


# ================= POSTERIOR PROBABILITY =================
def compute_posterior_probability(posterior_odds):

    return posterior_odds / (1 + posterior_odds)


# ================= SEVERITY LEVEL =================
def severity_level(prob):

    if prob < 0.06:
        return "Very Low"

    elif prob < 0.3:
        return "Low"

    elif prob < 0.7:
        return "High"

    else:
        return "Very High"


# ================= BUILD SEVERITY MATRIX =================
def build_severity_matrix(results):

    matrix = {}

    for r in results:

        param = r["parameter"]
        defect = r["defect"]

        if param not in matrix:
            matrix[param] = {}

        matrix[param][defect] = r["severity"]

    return matrix


# ================= DASHBOARD DATA =================
def build_dashboard_data(results):

    severity_counts = {
        "Very Low": 0,
        "Low": 0,
        "High": 0,
        "Very High": 0
    }

    for r in results:
        severity_counts[r["severity"]] += 1

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


# ================= MAIN DIAGNOSIS FUNCTION =================
def run_diagnosis(file_path):

    df = load_dataset(file_path)

    # Dataset structure
    heat_column = df.columns[0]
    target_columns = df.columns[1:6]
    input_columns = df.columns[6:]

    # Ensure numeric inputs
    df[input_columns] = df[input_columns].apply(
        pd.to_numeric, errors="coerce"
    ).fillna(0)

    dataset_summary = {
        "rows": len(df),
        "total_columns": len(df.columns),
        "input_parameters": len(input_columns),
        "defect_types": len(target_columns)
    }

    logging.info(f"Dataset Summary: {dataset_summary}")

    ranges = compute_parameter_ranges(df, input_columns)

    results = []

    for param in input_columns:

        param_ranges = ranges[param]

        for r in param_ranges:

            lp = compute_local_probability(df, param, r)
            prior_odds = compute_prior_odds(lp)

            for defect in target_columns:

                cp = compute_conditional_probability(df, param, r, defect, lp)
                lr = compute_likelihood_ratio(cp)
                post_odds = compute_posterior_odds(prior_odds, lr)
                posterior = compute_posterior_probability(post_odds)

                result = {
                    "parameter": param,
                    "range": f"{round(r[0],4)} - {round(r[1],4)}",
                    "defect": defect,
                    "local_probability": round(lp,4),
                    "prior_odds": round(prior_odds,4),
                    "conditional_probability": round(cp,4),
                    "likelihood_ratio": round(lr,4),
                    "posterior_odds": round(post_odds,4),
                    "posterior_probability": round(posterior,4),
                    "severity": severity_level(posterior)
                }

                results.append(result)

    # ================= CRITICAL PARAMETERS =================
    critical_parameters = [
        r for r in results
        if r["posterior_probability"] > 0.5
    ]

    # ================= SEVERITY MATRIX =================
    severity_matrix = build_severity_matrix(results)

    # ================= DASHBOARD =================
    dashboard_data = build_dashboard_data(results)

    logging.info(f"Diagnosis completed with {len(results)} results")

    return {
        "dataset_summary": dataset_summary,
        "diagnosis_results": results,
        "critical_parameters": critical_parameters,
        "severity_matrix": severity_matrix,
        "dashboard_data": dashboard_data
    }