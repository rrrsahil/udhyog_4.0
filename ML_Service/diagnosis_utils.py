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

        interval = (max_val - min_val) / 4

        r1 = (min_val, min_val + interval)
        r2 = (min_val + interval, min_val + 2 * interval)
        r3 = (min_val + 2 * interval, min_val + 3 * interval)
        r4 = (min_val + 3 * interval, max_val)

        ranges[col] = [r1, r2, r3, r4]

    return ranges


# ================= LOCAL PROBABILITY =================
def compute_local_probability(df, col, value_range):

    low, high = value_range

    count = df[(df[col] >= low) & (df[col] <= high)].shape[0]

    if len(df) == 0:
        return 0

    return count / len(df)


# ================= JOINT PROBABILITY =================
def compute_joint_probability(df, col, value_range, defect_col):

    low, high = value_range

    subset = df[(df[col] >= low) & (df[col] <= high)]

    defect_occurrence = subset[subset[defect_col] == 1]

    if len(df) == 0:
        return 0

    return len(defect_occurrence) / len(df)


# ================= CONDITIONAL PROBABILITY =================
def compute_conditional_probability(df, col, value_range, defect_col):

    low, high = value_range

    subset = df[(df[col] >= low) & (df[col] <= high)]

    if len(subset) == 0:
        return 0

    defect_occurrence = subset[subset[defect_col] == 1]

    return len(defect_occurrence) / len(subset)


# ================= POSTERIOR PROBABILITY =================
def compute_posterior_probability(lp, cp):

    return lp * cp


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


# ================= MAIN DIAGNOSIS FUNCTION =================
def run_diagnosis(file_path):

    df = load_dataset(file_path)

    # Dataset structure
    heat_column = df.columns[0]
    target_columns = df.columns[1:6]
    input_columns = df.columns[6:]

    # Ensure numeric values for inputs
    df[input_columns] = df[input_columns].apply(
        pd.to_numeric, errors="coerce"
    ).fillna(0)

    # Dataset summary
    dataset_summary = {
        "rows": len(df),
        "total_columns": len(df.columns),
        "input_parameters": len(input_columns),
        "defect_types": len(target_columns)
    }

    logging.info(f"Dataset Summary: {dataset_summary}")

    # Compute ranges
    ranges = compute_parameter_ranges(df, input_columns)

    results = []

    for param in input_columns:

        param_ranges = ranges[param]

        for r in param_ranges:

            lp = compute_local_probability(df, param, r)

            for defect in target_columns:

                cp = compute_conditional_probability(df, param, r, defect)

                posterior = compute_posterior_probability(lp, cp)

                result = {
                    "parameter": param,
                    "range": f"{round(r[0],4)} - {round(r[1],4)}",
                    "defect": defect,
                    "local_probability": round(lp,4),
                    "conditional_probability": round(cp,4),
                    "posterior_probability": round(posterior,4),
                    "severity": severity_level(posterior)
                }

                results.append(result)

    # Detect critical parameters
    critical_parameters = [
        r for r in results
        if r["posterior_probability"] > 0.5
    ]

    logging.info(f"Diagnosis completed with {len(results)} results")

    return {
        "dataset_summary": dataset_summary,
        "diagnosis_results": results,
        "critical_parameters": critical_parameters
    }