#!/usr/bin/env python3
"""
Transfer Course Matching System — v3 (Sprint III — Blocking Strategy)
=====================================================================
Sprint III improvements:
  • Blocking Index: courses indexed by subject_code for O(1) candidate lookup
  • Optimized Inference: predict_batch_blocked compares only within-subject
    candidates, reducing comparisons from O(n²) to O(n×k)
  • Blocking-based synthetic data generation (O(n×k) vs O(n²))

Carried from v2:
  • Engineered 19-dim feature vector (subject_match, level_ok, one-hot, etc.)
  • BatchNorm + Dropout architecture for better generalization
  • Feature normalization (z-score)
  • Train/validation split with early stopping & LR scheduling
  • Model caching + batch inference

Install:  pip install torch mysql-connector-python pandas

Usage:
    python transfer_matcher_full.py train
    python transfer_matcher_full.py predict '{"source":[3,0,0,0],"target":[3,0,0,0]}'
    python transfer_matcher_full.py predict '{"features":[3,0,0,0,3,0,0,0]}'  # legacy
    python transfer_matcher_full.py status
    python transfer_matcher_full.py export
    python transfer_matcher_full.py build_samples
"""

import sys, os, json, re, argparse, datetime
from typing import List, Optional
from collections import defaultdict

import torch
import torch.nn as nn
import torch.optim as optim

# ── CONFIG ────────────────────────────────────────────────────────────────────

MODEL_PATH      = os.path.join(os.path.dirname(__file__), "model_weights.pt")
MODEL_META_PATH = os.path.join(os.path.dirname(__file__), "model_meta.json")

NUM_SUBJECTS = 6
FEATURE_SIZE = 19  # 7 engineered + 6 src one-hot + 6 tgt one-hot

# ── FEATURE ENGINEERING ──────────────────────────────────────────────────────

def build_feature_vector(src, tgt):
    """
    Build 19-dim engineered feature vector from raw course attributes.
    src/tgt: [credit_hours, level_code, subject_code, has_lab]
    """
    sc, sl, ss, slab = float(src[0]), int(src[1]), int(src[2]), float(src[3])
    tc, tl, ts       = float(tgt[0]), int(tgt[1]), int(tgt[2])

    src_oh = [1.0 if i == ss else 0.0 for i in range(NUM_SUBJECTS)]
    tgt_oh = [1.0 if i == ts else 0.0 for i in range(NUM_SUBJECTS)]

    return [
        1.0 if ss == ts else 0.0,        # subject_match
        float(sl - tl),                   # level_diff (signed)
        1.0 if sl >= tl else 0.0,         # level_meets_or_exceeds
        sc / max(tc, 0.5),                # credit_ratio
        1.0 if sc >= tc - 0.5 else 0.0,   # credit_meets_or_exceeds
        abs(sc - tc),                      # credit_diff
        slab,                              # src_has_lab
        *src_oh, *tgt_oh,
    ]

def _legacy_to_pair(f8):
    """Convert old 8-element vector to (src, tgt) attribute pair."""
    return f8[:4], [f8[4], f8[5], f8[6], 0]

# ── BLOCKING INDEX (Sprint III — MP Subject Filter) ─────────────────────────

def build_blocking_index(course_list):
    """
    Organize courses into a dict keyed by subject_code (index 2).

    Each course is expected to be a 4-element list:
        [credit_hours, level_code, subject_code, has_lab]

    Returns:
        dict[int, list[list]]  — subject_code → list of course attribute vectors

    This reduces candidate generation from O(n²) to O(n×k), where k is the
    average number of courses per subject bucket.
    """
    index = defaultdict(list)
    for course in course_list:
        subject_code = int(course[2])
        index[subject_code].append(course)
    return dict(index)

# ── NEURAL NETWORK (v2) ─────────────────────────────────────────────────────

class TransferMatcherNet(nn.Module):
    """Input(19) → Dense(64,BN,ReLU,Drop) → Dense(32,BN,ReLU,Drop) → Dense(16,ReLU) → Sigmoid"""

    def __init__(self, input_size=FEATURE_SIZE):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 64), nn.BatchNorm1d(64), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(64, 32),         nn.BatchNorm1d(32), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 16),         nn.ReLU(),
            nn.Linear(16, 1),          nn.Sigmoid(),
        )

    def forward(self, x):
        return self.network(x)

# ── NORMALIZATION ────────────────────────────────────────────────────────────

def _compute_norm(X):
    mean = X.mean(dim=0)
    std  = X.std(dim=0)
    std[std < 1e-6] = 1.0
    return mean, std

def _normalize(X, mean, std):
    return (X - mean) / std

# ── SAMPLE TRAINING DATA ────────────────────────────────────────────────────

def get_sample_training_data():
    """Hand-crafted (source_attrs, target_attrs, label) triples."""
    return [
        # Strong matches
        ([3,0,0,0],[3,0,0,0],1), ([3,1,0,0],[3,1,0,0],1), ([4,1,1,1],[4,1,1,0],1),
        ([3,0,2,0],[3,0,2,0],1), ([4,2,4,0],[4,2,4,0],1), ([3,0,3,0],[3,0,3,0],1),
        ([3,1,4,0],[3,1,4,0],1), ([4,0,1,1],[4,0,1,0],1), ([3,3,4,0],[3,3,4,0],1),
        ([3,0,5,0],[3,0,5,0],1),
        # Higher level satisfies lower
        ([3,1,0,0],[3,0,0,0],1), ([4,2,1,1],[3,1,1,0],1), ([3,3,0,0],[3,2,0,0],1),
        ([4,3,4,0],[3,2,4,0],1), ([3,2,2,0],[3,1,2,0],1), ([4,1,1,1],[3,0,1,0],1),
        # Level too low
        ([3,0,4,0],[3,1,4,0],0), ([3,1,0,0],[3,2,0,0],0), ([3,2,4,0],[3,3,4,0],0),
        ([3,0,2,0],[3,1,2,0],0),
        # Credit insufficient
        ([3,0,0,0],[4,0,0,0],0), ([1,0,0,0],[4,0,0,0],0), ([2,1,2,0],[5,1,2,0],0),
        # Wrong subject
        ([3,0,0,0],[3,0,1,0],0), ([3,0,2,0],[3,0,0,0],0), ([4,1,4,0],[4,1,1,0],0),
        ([3,0,3,0],[3,0,4,0],0), ([3,1,1,1],[3,1,4,0],0), ([4,2,5,0],[4,2,0,0],0),
        ([3,1,0,0],[3,1,3,0],0), ([4,0,4,0],[4,0,2,0],0),
        # Edge cases
        ([3,0,0,0],[3,0,0,1],1), ([4,2,1,0],[4,2,1,1],1),
        ([3.5,0,0,0],[3,0,0,0],1), ([2.5,0,0,0],[3,0,0,0],1),
    ]

# ── TRAIN ────────────────────────────────────────────────────────────────────

def _samples_to_tensors(samples):
    """Convert any supported sample format to (X, y) tensors."""
    fvs, labels = [], []
    for s in samples:
        if isinstance(s, dict):
            if "source" in s and "target" in s:
                fv = build_feature_vector(s["source"], s["target"])
            elif "features" in s:
                f = s["features"]
                fv = build_feature_vector(*_legacy_to_pair(f)) if len(f) == 8 else f
            else:
                continue
            fvs.append(fv); labels.append(float(s["label"]))
        elif isinstance(s, (list, tuple)) and len(s) == 3:
            fvs.append(build_feature_vector(s[0], s[1])); labels.append(float(s[2]))
        elif isinstance(s, (list, tuple)) and len(s) == 2:
            f, lbl = s
            fv = build_feature_vector(*_legacy_to_pair(f)) if len(f) == 8 else f
            fvs.append(fv); labels.append(float(lbl))
    return (torch.tensor(fvs, dtype=torch.float32),
            torch.tensor(labels, dtype=torch.float32).unsqueeze(1))

def train_model(samples=None, epochs=300, learning_rate=0.001, patience=50):
    """Train with validation split, early stopping, and LR scheduling."""
    if not samples:
        samples = get_sample_training_data()

    X, y = _samples_to_tensors(samples)
    n = len(X)

    # Normalize
    feat_mean, feat_std = _compute_norm(X)
    X_norm = _normalize(X, feat_mean, feat_std)

    # 80/20 split
    idx   = torch.randperm(n)
    split = max(int(n * 0.8), 1)
    Xt, yt = X_norm[idx[:split]], y[idx[:split]]
    Xv, yv = X_norm[idx[split:]], y[idx[split:]]
    has_val = len(Xv) > 0

    model     = TransferMatcherNet()
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", patience=20, factor=0.5, min_lr=1e-6)

    best_val, pat_cnt, best_state, final_ep = float("inf"), 0, None, 0

    for ep in range(epochs):
        model.train()
        optimizer.zero_grad()
        loss = criterion(model(Xt), yt)
        loss.backward()
        optimizer.step()

        if has_val:
            model.eval()
            with torch.no_grad():
                vl = criterion(model(Xv), yv).item()
            scheduler.step(vl)
            if vl < best_val:
                best_val, pat_cnt = vl, 0
                best_state = {k: v.clone() for k, v in model.state_dict().items()}
            else:
                pat_cnt += 1
                if pat_cnt >= patience:
                    print(f"  ⏹  Early stopping at epoch {ep+1}")
                    break
        final_ep = ep + 1

    if best_state:
        model.load_state_dict(best_state)

    model.eval()
    with torch.no_grad():
        preds = model(X_norm)
        accuracy   = ((preds >= 0.5).float() == y).float().mean().item()
        final_loss = criterion(preds, y).item()

    torch.save(model.state_dict(), MODEL_PATH)

    meta = {
        "isTrained": True,
        "lastTrainedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "trainingAccuracy": round(accuracy, 4),
        "epochs": final_ep, "finalLoss": round(final_loss, 6),
        "bestValLoss": round(best_val, 6) if has_val else None,
        "numSamples": n, "featureSize": FEATURE_SIZE,
        "architecture": f"Input({FEATURE_SIZE})→Dense(64,BN,ReLU,Drop0.3)"
                        f"→Dense(32,BN,ReLU,Drop0.2)→Dense(16,ReLU)→Sigmoid",
        "normalization": {"mean": feat_mean.tolist(), "std": feat_std.tolist()},
    }
    with open(MODEL_META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    # Clear cached model so next predict picks up new weights
    global _cached_model, _cached_norm
    _cached_model = _cached_norm = None

    return {
        "success": True, "epochs": final_ep,
        "finalLoss": round(final_loss, 6), "accuracy": round(accuracy, 4),
        "message": f"Training complete. {round(accuracy*100,1)}% accuracy on "
                   f"{n} samples ({final_ep} epochs).",
    }

# ── PREDICT (cached) ────────────────────────────────────────────────────────

_cached_model = None
_cached_norm  = None

def _load_model():
    global _cached_model, _cached_norm
    if _cached_model is not None:
        return _cached_model, _cached_norm
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("Model not trained. Run: python transfer_matcher_full.py train")
    m = TransferMatcherNet()
    m.load_state_dict(torch.load(MODEL_PATH, weights_only=True))
    m.eval()
    norm = (torch.zeros(FEATURE_SIZE), torch.ones(FEATURE_SIZE))
    if os.path.exists(MODEL_META_PATH):
        with open(MODEL_META_PATH) as f:
            nd = json.load(f).get("normalization", {})
        if "mean" in nd and "std" in nd:
            norm = (torch.tensor(nd["mean"], dtype=torch.float32),
                    torch.tensor(nd["std"],  dtype=torch.float32))
    _cached_model, _cached_norm = m, norm
    return m, norm

def _classify(prob):
    conf = "high" if prob >= 0.75 or prob <= 0.25 else \
           "medium" if prob >= 0.60 or prob <= 0.40 else "low"
    return {"matchProbability": round(prob, 4), "isMatch": prob >= 0.5, "confidence": conf}

def predict(features=None, source=None, target=None):
    """Single prediction. Accepts (source, target) attrs or a feature vector."""
    model, (mean, std) = _load_model()
    if source is not None and target is not None:
        fv = build_feature_vector(source, target)
    elif features is not None:
        fv = build_feature_vector(*_legacy_to_pair(features)) if len(features) == 8 else features
    else:
        raise ValueError("Provide (source, target) or features")
    X = _normalize(torch.tensor([fv], dtype=torch.float32), mean, std)
    with torch.no_grad():
        return _classify(model(X).item())

def predict_batch(pairs):
    """Batch prediction — much faster than repeated single calls."""
    model, (mean, std) = _load_model()
    fvs = []
    for p in pairs:
        if "source" in p and "target" in p:
            fvs.append(build_feature_vector(p["source"], p["target"]))
        elif "features" in p:
            f = p["features"]
            fvs.append(build_feature_vector(*_legacy_to_pair(f)) if len(f) == 8 else f)
    if not fvs:
        return []
    X = _normalize(torch.tensor(fvs, dtype=torch.float32), mean, std)
    with torch.no_grad():
        probs = model(X).squeeze(-1).tolist()
    if isinstance(probs, float):
        probs = [probs]
    return [_classify(p) for p in probs]


def predict_batch_blocked(source_course, blocking_index):
    """
    Sprint III optimized prediction using the blocking index.

    Instead of comparing source_course against ALL target courses (O(n)),
    this retrieves only candidates that share the same subject_code (O(k)).

    Args:
        source_course: [credit_hours, level_code, subject_code, has_lab]
        blocking_index: dict from build_blocking_index()

    Returns:
        list[dict] — scored candidates, each with 'target', 'matchProbability',
                     'isMatch', and 'confidence' keys, sorted by probability desc.
    """
    subject_code = int(source_course[2])
    candidates = blocking_index.get(subject_code, [])

    if not candidates:
        return []

    # Build pairs only for same-subject candidates
    pairs = [
        {"source": source_course, "target": tgt}
        for tgt in candidates
        if tgt != source_course  # skip self-comparison
    ]

    if not pairs:
        return []

    # Run the neural network only on filtered candidates
    results = predict_batch(pairs)

    # Attach candidate info to each result
    scored = []
    for pair, result in zip(pairs, results):
        scored.append({
            "target": pair["target"],
            "matchProbability": result["matchProbability"],
            "isMatch": result["isMatch"],
            "confidence": result["confidence"],
        })

    # Sort by match probability descending
    scored.sort(key=lambda x: x["matchProbability"], reverse=True)
    return scored


def find_matches_for_courses(source_courses, target_courses):
    """
    Sprint III high-level API: find matches for multiple source courses
    against a pool of target courses, using the blocking strategy.

    Complexity: O(n × k) where k = avg courses per subject bucket,
    versus O(n × m) for the brute-force approach.

    Args:
        source_courses: list of [credit_hours, level_code, subject_code, has_lab]
        target_courses: list of [credit_hours, level_code, subject_code, has_lab]

    Returns:
        dict: source_index → list of scored candidate matches
    """
    # Build blocking index from target courses
    blocking_index = build_blocking_index(target_courses)

    all_matches = {}
    for i, src in enumerate(source_courses):
        all_matches[i] = predict_batch_blocked(src, blocking_index)

    return all_matches

# ── STATUS ───────────────────────────────────────────────────────────────────

def get_status():
    if os.path.exists(MODEL_META_PATH):
        with open(MODEL_META_PATH) as f:
            meta = json.load(f)
        meta["modelPath"] = MODEL_PATH
        return meta
    return {"isTrained": False, "modelPath": MODEL_PATH, "featureSize": FEATURE_SIZE}

# ── MYSQL EXPORT ─────────────────────────────────────────────────────────────

def export_database(host="127.0.0.1", port=3306, user="appuser",
                    password="apppass", database="TransferPro",
                    output_dir="csv_exports"):
    try:
        import mysql.connector, pandas as pd
    except ImportError:
        raise SystemExit("Run:  pip install mysql-connector-python pandas")
    os.makedirs(output_dir, exist_ok=True)
    print(f"Connecting to MySQL  {host}:{port}  db='{database}' ...")
    conn   = mysql.connector.connect(host=host, port=port, user=user,
                                     password=password, database=database)
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES;")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"Found {len(tables)} tables: {tables}\n")
    exported = []
    for t in tables:
        try:
            df = pd.read_sql(f"SELECT * FROM `{t}`", conn)
            p  = os.path.join(output_dir, f"{t}.csv")
            df.to_csv(p, index=False)
            print(f"  ✅  {t}: {len(df)} rows  →  {p}")
            exported.append({"table": t, "rows": len(df), "path": p})
        except Exception as e:
            print(f"  ❌  {t}: {e}")
    cursor.close(); conn.close()
    print(f"\nExported {len(exported)}/{len(tables)} tables to '{output_dir}/'")
    return exported

# ── CSV → TRAINING SAMPLES ──────────────────────────────────────────────────

SUBJECT_MAP = {
    "math": 0, "mathematics": 0,
    "science": 1, "biology": 1, "chemistry": 1, "physics": 1,
    "english": 2, "writing": 2, "composition": 2,
    "history": 3, "social": 3,
    "cs": 4, "computer": 4, "programming": 4, "information": 4, "technology": 4,
}

def _encode_subject(s):
    if not isinstance(s, str): return 5
    s = s.lower().strip()
    for kw, code in SUBJECT_MAP.items():
        if kw in s: return code
    return 5

def _encode_level(val):
    if val is None: return 0
    nums = re.findall(r"\d+", str(val))
    if nums:
        n = int(nums[0])
        if n >= 400: return 3
        if n >= 300: return 2
        if n >= 200: return 1
    return 0

def _encode_has_lab(val):
    if isinstance(val, bool):        return int(val)
    if isinstance(val, (int, float)): return int(bool(val))
    if isinstance(val, str):          return 1 if val.strip().lower() in ("1","true","yes","y") else 0
    return 0

def _safe_float(val, default=3.0):
    try: return float(val)
    except: return default

def _detect_cols(df):
    cols = {c.lower().replace(" ", "_"): c for c in df.columns}
    def find(*names):
        for n in names:
            if n.lower().replace(" ", "_") in cols:
                return cols[n.lower().replace(" ", "_")]
        return None
    return {
        "title":        find("title","name","course_name","course_title"),
        "subject":      find("subject","subject_area","department","dept"),
        "level":        find("level","course_level","number","course_number","code"),
        "credit_hours": find("credit_hours","credits","units","credit_unit"),
        "has_lab":      find("has_lab","lab","laboratory","includes_lab"),
        "is_match":     find("is_match","match","approved","articulated","equivalent"),
        "source_id":    find("source_course_id","source_id","from_course_id","course_id"),
        "target_id":    find("target_course_id","target_id","to_course_id","requirement_id"),
    }

def _row_feats(row, cols):
    return [
        _safe_float(row.get(cols["credit_hours"]) if cols.get("credit_hours") else None),
        _encode_level(row.get(cols["level"])       if cols.get("level")       else None),
        _encode_subject(str(row.get(cols["subject"]) if cols.get("subject")   else "")),
        _encode_has_lab(row.get(cols["has_lab"])   if cols.get("has_lab")     else None),
    ]

def _build_from_rules(rules_df, courses_df):
    r_cols = _detect_cols(rules_df)
    c_cols = _detect_cols(courses_df)
    id_col = next((c for c in ("id","course_id","ID") if c in courses_df.columns), None)
    if not id_col: return []
    idx     = {str(r[id_col]): r for _, r in courses_df.iterrows()}
    samples = []
    for _, rule in rules_df.iterrows():
        src_id = str(rule.get(r_cols.get("source_id") or "")) if r_cols.get("source_id") else None
        tgt_id = str(rule.get(r_cols.get("target_id") or "")) if r_cols.get("target_id") else None
        if src_id not in idx or tgt_id not in idx: continue
        sf = _row_feats(idx[src_id], c_cols)
        tf = _row_feats(idx[tgt_id], c_cols)
        is_match_val = rule.get(r_cols.get("is_match") or "") if r_cols.get("is_match") else None
        label = 1.0 if _encode_has_lab(is_match_val) == 1 else 0.0
        samples.append({"source": sf, "target": tf, "label": label})
    return samples

def _build_synthetic(courses_df):
    """
    Blocking-based synthetic data generation using build_blocking_index.

    Complexity: O(n × k) per subject instead of O(n²) over all courses,
    where k = number of courses within a single subject bucket.

    Same-subject pairs produce positives (when level/credit rules pass)
    and negatives (when they fail). A small sample of cross-subject pairs
    provides hard negatives so the model learns the subject_match signal.
    """
    c_cols = _detect_cols(courses_df)
    if courses_df.empty:
        return []

    # Extract attribute vectors from the DataFrame
    all_courses = [_row_feats(r, c_cols) for _, r in courses_df.iterrows()]

    # Build blocking index using the shared utility
    blocking_index = build_blocking_index(all_courses)

    samples = []
    subjects = list(blocking_index.keys())

    # ── Same-subject pairs (positives + negatives via level/credit rules) ──
    for subj, group in blocking_index.items():
        for i, src in enumerate(group):
            for j, tgt in enumerate(group):
                if i == j:
                    continue  # skip self-comparison
                label = 1.0 if (src[1] >= tgt[1] and src[0] >= tgt[0] - 0.5) else 0.0
                samples.append({"source": src, "target": tgt, "label": label})

    # ── Cross-subject negatives (sampled, not exhaustive) ──
    # Only sample a few pairs so the model learns cross-subject = no match
    for si, subj in enumerate(subjects):
        for other in subjects[si + 1 : si + 3]:
            for src in blocking_index[subj][:5]:
                for tgt in blocking_index[other][:5]:
                    samples.append({"source": src, "target": tgt, "label": 0.0})

    # Cap to avoid memory issues on large catalogs
    if len(samples) > 2000:
        import random
        random.shuffle(samples)
        samples = samples[:2000]

    return samples

COURSE_TABLE_NAMES = ["courses","course","course_list","catalog"]
RULES_TABLE_NAMES  = ["transfer_rules","articulation","equivalencies",
                       "transfer_articulation","course_equivalency","articulation_agreements"]

def build_samples_from_csvs(csv_dir="csv_exports", output_path="training_samples.json"):
    try:
        import pandas as pd
    except ImportError:
        raise SystemExit("Run:  pip install pandas")
    if not os.path.isdir(csv_dir):
        print(f"⚠  '{csv_dir}' not found — run 'export' first."); return []
    dfs = {}
    print(f"Loading CSVs from '{csv_dir}' ...")
    for fname in os.listdir(csv_dir):
        if not fname.endswith(".csv"): continue
        key = fname.replace(".csv","").lower()
        try:
            dfs[key] = pd.read_csv(os.path.join(csv_dir, fname))
            print(f"  📄  {fname}: {len(dfs[key])} rows  |  cols: {list(dfs[key].columns)}")
        except Exception as e:
            print(f"  ⚠   {fname}: {e}")
    courses_df = next((dfs[k] for k in COURSE_TABLE_NAMES if k in dfs), __import__("pandas").DataFrame())
    rules_df   = next((dfs[k] for k in RULES_TABLE_NAMES  if k in dfs), __import__("pandas").DataFrame())
    samples = []
    if not rules_df.empty and not courses_df.empty:
        samples = _build_from_rules(rules_df, courses_df)
        print(f"\n→ {len(samples)} samples from rules/articulation table")
    if len(samples) < 10 and not courses_df.empty:
        samples = _build_synthetic(courses_df)
        print(f"→ {len(samples)} synthetic samples (blocking-based)")
    if not samples:
        print("⚠  No samples generated."); return []
    matches = sum(1 for s in samples if s["label"] == 1.0)
    print(f"\n✅  {len(samples)} total samples  ({matches} matches, {len(samples)-matches} non-matches)")
    with open(output_path, "w") as f:
        json.dump(samples, f, indent=2)
    print(f"💾  Saved → {output_path}")
    return samples

def retrain_via_api(samples, api_base="http://localhost:80/api", epochs=200):
    try:
        import requests as req
    except ImportError:
        raise SystemExit("Run:  pip install requests")
    url = f"{api_base.rstrip('/')}/match/train"
    print(f"\n🚀  Sending {len(samples)} samples to {url} (epochs={epochs}) ...")
    try:
        r = req.post(url, json={"samples": samples, "epochs": epochs}, timeout=120)
        r.raise_for_status()
        res = r.json()
        print(f"  ✅  Accuracy: {round(float(res.get('accuracy',0))*100,1)}%"
              f"  |  Loss: {res.get('finalLoss')}  |  {res.get('message')}")
    except Exception as e:
        print(f"  ❌  API request failed: {e}")

# ── NLP + KU FEATURES (Sprint IV) ───────────────────────────────────────────

NLP_FEATURE_SIZE  = 14
NLP_MODEL_PATH    = os.path.join(os.path.dirname(__file__), "model_nlp_weights.pt")
NLP_MODEL_META_PATH = os.path.join(os.path.dirname(__file__), "model_nlp_meta.json")
DEFAULT_CSV_DIR  = os.path.join(os.path.dirname(__file__), "..", "..", "..",
                                 "Documents", "csv_exports")

# ── NLP Preprocessing ────────────────────────────────────────────────────────

def _clean_text(text):
    """Lowercase, strip special chars, normalise whitespace."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def load_ku_data(csv_dir=DEFAULT_CSV_DIR):
    """
    Load courses, knowledge_units, and course_ku CSVs.

    Returns:
        courses_df   — pandas DataFrame of all courses
        ku_map       — dict[ku_id -> {name, description}]
        course_ku_map — defaultdict[course_id -> set of ku_ids]
    """
    try:
        import pandas as pd
    except ImportError:
        raise SystemExit("Run:  pip install pandas")

    csv_dir = os.path.abspath(csv_dir)
    paths = {
        "courses":         os.path.join(csv_dir, "courses.csv"),
        "knowledge_units": os.path.join(csv_dir, "knowledge_units.csv"),
        "course_ku":       os.path.join(csv_dir, "course_ku.csv"),
    }
    for name, p in paths.items():
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing CSV '{name}': {p}")

    courses_df = pd.read_csv(paths["courses"])
    ku_df      = pd.read_csv(paths["knowledge_units"])
    ck_df      = pd.read_csv(paths["course_ku"])

    ku_map = {
        int(r["ku_id"]): {"name": str(r.get("ku_name", "")),
                           "description": str(r.get("ku_description", ""))}
        for _, r in ku_df.iterrows()
    }

    course_ku_map = defaultdict(set)
    for _, r in ck_df.iterrows():
        course_ku_map[int(r["course_id"])].add(int(r["ku_id"]))

    return courses_df, ku_map, course_ku_map


def build_ku_text_profiles(courses_df, ku_map, course_ku_map):
    """
    Build a KU text profile per course = all KU names + descriptions joined.

    Returns dict[course_id -> {name, ku_profile, ku_ids}]
    """
    profiles = {}
    for _, row in courses_df.iterrows():
        cid         = int(row["course_id"])
        course_name = _clean_text(str(row.get("course_name", "")))
        ku_ids      = course_ku_map.get(cid, set())
        ku_texts    = []
        for kid in sorted(ku_ids):
            ku = ku_map.get(kid, {})
            ku_texts.extend([_clean_text(ku.get("name", "")),
                             _clean_text(ku.get("description", ""))])
        profiles[cid] = {
            "name":       course_name,
            "ku_profile": " ".join(t for t in ku_texts if t) or "unknown",
            "ku_ids":     ku_ids,
        }
    return profiles


def build_tfidf_vectors(profiles):
    """
    Fit two TF-IDF vectorisers — one for KU profiles, one for course names.

    Returns (ku_tfidf, name_tfidf, ku_matrix, name_matrix, course_ids)
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
    except ImportError:
        raise SystemExit("Run:  pip install scikit-learn")

    course_ids  = sorted(profiles.keys())
    ku_texts    = [profiles[c]["ku_profile"] for c in course_ids]
    name_texts  = [profiles[c]["name"] or "unknown" for c in course_ids]

    ku_tfidf   = TfidfVectorizer(min_df=1, ngram_range=(1, 2))
    name_tfidf = TfidfVectorizer(min_df=1, ngram_range=(1, 2))

    ku_matrix   = ku_tfidf.fit_transform(ku_texts)
    name_matrix = name_tfidf.fit_transform(name_texts)

    return ku_tfidf, name_tfidf, ku_matrix, name_matrix, course_ids


# ── KU Feature Engineering ────────────────────────────────────────────────────

def compute_nlp_features(src_cid, tgt_cid, profiles, ku_matrix, name_matrix,
                          course_ids, courses_df):
    """
    Build 14-dimensional NLP feature vector for a (source, target) course pair.

    Dims:
      0  src_credits          4  tgt_credits
      1  src_level            5  tgt_level
      2  src_subject          6  tgt_subject
      3  src_has_lab          7  credit_diff (abs)
      8  ku_overlap_ratio     9  ku_count_src
      10 ku_count_tgt         11 ku_count_diff
      12 tfidf_cosine_sim     13 name_cosine_sim
    """
    from sklearn.metrics.pairwise import cosine_similarity

    cid_idx = {c: i for i, c in enumerate(course_ids)}

    def _get_row(cid):
        rows = courses_df[courses_df["course_id"] == cid]
        return rows.iloc[0] if not rows.empty else None

    def _credits(row):
        try: return float(row["credits"]) if row is not None else 3.0
        except: return 3.0

    def _level(row):
        if row is None: return 0
        nums = re.findall(r"\d+", str(row.get("course_code", "")))
        if nums:
            n = int(nums[0])
            if n >= 400: return 3
            if n >= 300: return 2
            if n >= 200: return 1
        return 0

    def _subj(row):
        if row is None: return 4
        return _encode_subject(str(row.get("course_name", "")) + " " +
                               str(row.get("course_code", "")))

    sr, tr = _get_row(src_cid), _get_row(tgt_cid)
    src_credits, tgt_credits = _credits(sr), _credits(tr)

    # KU sets
    src_kus = profiles.get(src_cid, {}).get("ku_ids", set())
    tgt_kus = profiles.get(tgt_cid, {}).get("ku_ids", set())
    union   = src_kus | tgt_kus
    inter   = src_kus & tgt_kus
    jaccard = len(inter) / len(union) if union else 0.0

    # TF-IDF cosine similarities
    si, ti = cid_idx.get(src_cid), cid_idx.get(tgt_cid)
    if si is not None and ti is not None:
        tfidf_cos = float(cosine_similarity(ku_matrix[si],   ku_matrix[ti])[0, 0])
        name_cos  = float(cosine_similarity(name_matrix[si], name_matrix[ti])[0, 0])
    else:
        tfidf_cos = name_cos = 0.0

    return [
        src_credits, float(_level(sr)), float(_subj(sr)), 0.0,   # 0-3
        tgt_credits, float(_level(tr)), float(_subj(tr)),           # 4-6
        abs(src_credits - tgt_credits),                              # 7
        jaccard,                                                      # 8
        float(len(src_kus)), float(len(tgt_kus)),                    # 9-10
        abs(float(len(src_kus)) - float(len(tgt_kus))),             # 11
        tfidf_cos, name_cos,                                         # 12-13
    ]


def build_nlp_training_samples(csv_dir=DEFAULT_CSV_DIR):
    """
    Generate labeled training samples from CSV KU data.

    Labelling rules (applied per pair):
      - label=1 if ku_jaccard >= 0.2 AND src_level >= tgt_level
                AND src_credits >= tgt_credits - 0.5
      - label=0 otherwise

    Produces ~600 pairs from 25 courses (all ordered pairs, no self-pairs).
    """
    try:
        import pandas as pd  # noqa
    except ImportError:
        raise SystemExit("Run:  pip install pandas scikit-learn")

    print(f"Loading KU data from '{os.path.abspath(csv_dir)}' ...")
    courses_df, ku_map, course_ku_map = load_ku_data(csv_dir)
    profiles = build_ku_text_profiles(courses_df, ku_map, course_ku_map)
    _, _, ku_matrix, name_matrix, course_ids = build_tfidf_vectors(profiles)
    print(f"  {len(courses_df)} courses | {len(ku_map)} KUs | "
          f"{sum(len(v) for v in course_ku_map.values())} course-KU links")

    samples = []
    for src_cid in course_ids:
        for tgt_cid in course_ids:
            if src_cid == tgt_cid:
                continue
            fv = compute_nlp_features(src_cid, tgt_cid, profiles,
                                      ku_matrix, name_matrix, course_ids, courses_df)
            level_ok   = fv[1] >= fv[5]
            credits_ok = fv[0] >= fv[4] - 0.5
            # Threshold lowered to 0.1 so partial-overlap pairs are captured.
            # Courses with NO KUs at all (fv[9]==0 and fv[10]==0) are never
            # positives since they share nothing semantically.
            has_kus = fv[9] > 0 or fv[10] > 0
            label = 1.0 if (has_kus and fv[8] >= 0.1 and level_ok and credits_ok) else 0.0
            samples.append({"features": fv, "label": label})

    matches = sum(1 for s in samples if s["label"] == 1.0)
    print(f"  Generated {len(samples)} pairs  "
          f"({matches} matches, {len(samples)-matches} non-matches)")
    return samples


# ── NLPTransferMatcherNet (14-input) ──────────────────────────────────────────

class NLPTransferMatcherNet(nn.Module):
    """Input(14) → Dense(64,ReLU,Drop0.3) → Dense(32,ReLU,Drop0.2) → Dense(16,ReLU) → Sigmoid"""

    def __init__(self, input_size=NLP_FEATURE_SIZE):
        super().__init__()
        self.features = nn.Sequential(
            nn.Linear(input_size, 64), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(64, 32),         nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 16),         nn.ReLU(),
        )
        self.head = nn.Linear(16, 1)

    def logits(self, x):
        """Raw pre-sigmoid output — use with BCEWithLogitsLoss during training."""
        return self.head(self.features(x))

    def forward(self, x):
        """Sigmoid probability — use for inference."""
        return torch.sigmoid(self.logits(x))


# ── NLP Training ──────────────────────────────────────────────────────────────

_cached_nlp_model = None
_cached_nlp_norm  = None


def train_nlp_model(csv_dir=DEFAULT_CSV_DIR, epochs=300,
                    learning_rate=0.001, patience=50):
    """Train NLPTransferMatcherNet from CSV KU data."""
    samples = build_nlp_training_samples(csv_dir)
    if not samples:
        return {"success": False, "message": "No training samples generated."}

    X = torch.tensor([s["features"] for s in samples], dtype=torch.float32)
    y = torch.tensor([s["label"]    for s in samples], dtype=torch.float32).unsqueeze(1)
    n = len(X)

    feat_mean, feat_std = _compute_norm(X)
    X_norm = _normalize(X, feat_mean, feat_std)

    idx   = torch.randperm(n)
    split = max(int(n * 0.8), 1)
    Xt, yt = X_norm[idx[:split]], y[idx[:split]]
    Xv, yv = X_norm[idx[split:]], y[idx[split:]]
    has_val = len(Xv) > 0

    model     = NLPTransferMatcherNet()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", patience=20, factor=0.5, min_lr=1e-6)

    # Class-weighted loss: positives are rare, give them proportional weight
    n_pos = y.sum().item()
    n_neg = n - n_pos
    pos_weight = torch.tensor([n_neg / max(n_pos, 1)], dtype=torch.float32)
    criterion  = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    best_val, pat_cnt, best_state, final_ep = float("inf"), 0, None, 0
    for ep in range(epochs):
        model.train()
        optimizer.zero_grad()
        loss = criterion(model.logits(Xt), yt)
        loss.backward()
        optimizer.step()
        if has_val:
            model.eval()
            with torch.no_grad():
                vl = criterion(model.logits(Xv), yv).item()
            scheduler.step(vl)
            if vl < best_val:
                best_val, pat_cnt = vl, 0
                best_state = {k: v.clone() for k, v in model.state_dict().items()}
            else:
                pat_cnt += 1
                if pat_cnt >= patience:
                    print(f"  ⏹  Early stopping at epoch {ep+1}")
                    break
        final_ep = ep + 1

    if best_state:
        model.load_state_dict(best_state)
    model.eval()
    bce = nn.BCELoss()
    with torch.no_grad():
        preds      = model(X_norm)          # sigmoid output for accuracy
        accuracy   = ((preds >= 0.5).float() == y).float().mean().item()
        final_loss = bce(preds, y).item()

    torch.save(model.state_dict(), NLP_MODEL_PATH)

    meta = {
        "isTrained": True,
        "lastTrainedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "trainingAccuracy": round(accuracy, 4),
        "epochs": final_ep, "finalLoss": round(final_loss, 6),
        "bestValLoss": round(best_val, 6) if has_val else None,
        "numSamples": n, "featureSize": NLP_FEATURE_SIZE,
        "architecture": "Input(14)→Dense(64,ReLU,Drop0.3)"
                        "→Dense(32,ReLU,Drop0.2)→Dense(16,ReLU)→Sigmoid",
        "csvDir": str(os.path.abspath(csv_dir)),
        "normalization": {"mean": feat_mean.tolist(), "std": feat_std.tolist()},
    }
    with open(NLP_MODEL_META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    global _cached_nlp_model, _cached_nlp_norm
    _cached_nlp_model = _cached_nlp_norm = None

    return {
        "success": True, "epochs": final_ep,
        "finalLoss": round(final_loss, 6), "accuracy": round(accuracy, 4),
        "numSamples": n,
        "message": f"NLP training complete. {round(accuracy*100,1)}% accuracy on "
                   f"{n} samples ({final_ep} epochs).",
    }


def _load_nlp_model():
    global _cached_nlp_model, _cached_nlp_norm
    if _cached_nlp_model is not None:
        return _cached_nlp_model, _cached_nlp_norm
    if not os.path.exists(NLP_MODEL_PATH):
        raise RuntimeError(
            "NLP model not trained. Run: python transfer_matcher_full.py train_nlp")
    m = NLPTransferMatcherNet()
    m.load_state_dict(torch.load(NLP_MODEL_PATH, weights_only=True))
    m.eval()
    norm = (torch.zeros(NLP_FEATURE_SIZE), torch.ones(NLP_FEATURE_SIZE))
    if os.path.exists(NLP_MODEL_META_PATH):
        with open(NLP_MODEL_META_PATH) as f:
            nd = json.load(f).get("normalization", {})
        if "mean" in nd and "std" in nd:
            norm = (torch.tensor(nd["mean"], dtype=torch.float32),
                    torch.tensor(nd["std"],  dtype=torch.float32))
    _cached_nlp_model, _cached_nlp_norm = m, norm
    return m, norm


# ── NLP Predict / Analyze ─────────────────────────────────────────────────────

def predict_nlp(src_course_id, tgt_course_id, csv_dir=DEFAULT_CSV_DIR):
    """
    Predict match probability between two courses (by course_id) using the
    NLP model.  Looks up KU data automatically.
    """
    model, (mean, std) = _load_nlp_model()
    courses_df, ku_map, course_ku_map = load_ku_data(csv_dir)
    profiles = build_ku_text_profiles(courses_df, ku_map, course_ku_map)
    _, _, ku_matrix, name_matrix, course_ids = build_tfidf_vectors(profiles)

    fv = compute_nlp_features(src_course_id, tgt_course_id, profiles,
                              ku_matrix, name_matrix, course_ids, courses_df)
    X = _normalize(torch.tensor([fv], dtype=torch.float32), mean, std)
    with torch.no_grad():
        prob = model(X).item()

    result = _classify(prob)
    result["sourceId"] = src_course_id
    result["targetId"] = tgt_course_id

    src_kus = profiles.get(src_course_id, {}).get("ku_ids", set())
    tgt_kus = profiles.get(tgt_course_id, {}).get("ku_ids", set())
    union   = src_kus | tgt_kus
    inter   = src_kus & tgt_kus
    result["kuOverlapRatio"] = round(len(inter) / len(union), 4) if union else 0.0
    result["tfidfCosineSim"] = round(fv[12], 4)
    result["nameCosineSim"]  = round(fv[13], 4)
    return result


def analyze_kus(src_course_id, tgt_course_id, csv_dir=DEFAULT_CSV_DIR):
    """
    Show detailed KU overlap analysis between two courses.
    """
    from sklearn.metrics.pairwise import cosine_similarity
    courses_df, ku_map, course_ku_map = load_ku_data(csv_dir)
    profiles = build_ku_text_profiles(courses_df, ku_map, course_ku_map)
    _, _, ku_matrix, name_matrix, course_ids = build_tfidf_vectors(profiles)
    cid_idx = {c: i for i, c in enumerate(course_ids)}

    def _name(cid):
        rows = courses_df[courses_df["course_id"] == cid]
        return rows.iloc[0]["course_name"] if not rows.empty else f"Course {cid}"

    src_kus  = profiles.get(src_course_id, {}).get("ku_ids", set())
    tgt_kus  = profiles.get(tgt_course_id, {}).get("ku_ids", set())
    shared   = src_kus & tgt_kus
    src_only = src_kus - tgt_kus
    tgt_only = tgt_kus - src_kus
    union    = src_kus | tgt_kus
    jaccard  = len(shared) / len(union) if union else 0.0

    si, ti = cid_idx.get(src_course_id), cid_idx.get(tgt_course_id)
    tfidf_cos = float(cosine_similarity(ku_matrix[si], ku_matrix[ti])[0, 0]) \
                if si is not None and ti is not None else 0.0
    name_cos  = float(cosine_similarity(name_matrix[si], name_matrix[ti])[0, 0]) \
                if si is not None and ti is not None else 0.0

    def _ku_list(ids):
        return [{"id": k, "name": ku_map.get(k, {}).get("name", "")} for k in sorted(ids)]

    return {
        "sourceCourse":    {"id": src_course_id, "name": _name(src_course_id),
                            "kuCount": len(src_kus), "kus": _ku_list(src_kus)},
        "targetCourse":    {"id": tgt_course_id, "name": _name(tgt_course_id),
                            "kuCount": len(tgt_kus), "kus": _ku_list(tgt_kus)},
        "sharedKUs":       _ku_list(shared),
        "srcOnlyKUs":      _ku_list(src_only),
        "tgtOnlyKUs":      _ku_list(tgt_only),
        "kuOverlapRatio":  round(jaccard, 4),
        "tfidfCosineSim": round(tfidf_cos, 4),
        "nameCosineSim":   round(name_cos, 4),
        "suggestedLabel":  1 if jaccard >= 0.2 else 0,
    }


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="transfer_matcher_full.py",
        description="Transfer Course Matching — Neural Network + Data Pipeline (v2)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  train         Train the model (built-in sample data or custom JSON)
  predict       Predict a match from source/target attrs or feature vector
  status        Show current model training status
  export        Export TransferPro MySQL database to CSV files
  build_samples Convert CSV exports to training samples
  train_nlp     Train NLP+KU model from CSV data          [NEW]
  predict_nlp   Predict using course IDs (KU-aware)       [NEW]
  analyze_kus   Show KU overlap analysis between courses  [NEW]

Examples:
  python transfer_matcher_full.py train
  python transfer_matcher_full.py train --epochs 300 --lr 0.001
  python transfer_matcher_full.py predict '{"source":[3,0,0,0],"target":[3,0,0,0]}'
  python transfer_matcher_full.py predict '{"features":[3,0,0,0,3,0,0,0]}'
  python transfer_matcher_full.py status
  python transfer_matcher_full.py build_samples --csv-dir csv_exports
  python transfer_matcher_full.py train_nlp
  python transfer_matcher_full.py train_nlp --csv-dir /path/to/csv_exports
  python transfer_matcher_full.py predict_nlp --source 1 --target 4
  python transfer_matcher_full.py analyze_kus  --source 1 --target 4
        """,
    )
    sub = parser.add_subparsers(dest="command")

    p_t = sub.add_parser("train", help="Train the neural network")
    p_t.add_argument("--epochs",  type=int,   default=300)
    p_t.add_argument("--lr",      type=float, default=0.001)
    p_t.add_argument("--patience",type=int,   default=50)
    p_t.add_argument("--samples", type=str,   default=None)

    p_p = sub.add_parser("predict", help="Run a prediction")
    p_p.add_argument("payload", nargs="?", default="{}")

    sub.add_parser("status", help="Show model training status")

    p_e = sub.add_parser("export", help="Export MySQL database to CSV")
    p_e.add_argument("--host",     default="127.0.0.1")
    p_e.add_argument("--port",     type=int, default=3306)
    p_e.add_argument("--user",     default="appuser")
    p_e.add_argument("--password", default="apppass")
    p_e.add_argument("--database", default="TransferPro")
    p_e.add_argument("--output",   default="csv_exports")

    p_b = sub.add_parser("build_samples", help="Convert CSVs to training samples")
    p_b.add_argument("--csv-dir", default="csv_exports")
    p_b.add_argument("--output",  default="training_samples.json")
    p_b.add_argument("--retrain", action="store_true")
    p_b.add_argument("--api",     default="http://localhost:80/api")
    p_b.add_argument("--epochs",  type=int, default=300)

    # ── NLP subcommands ────────────────────────────────────────────────────────
    p_tn = sub.add_parser("train_nlp",
                          help="Train NLP+KU model from CSV data")
    p_tn.add_argument("--csv-dir", default=DEFAULT_CSV_DIR,
                      help="Directory containing courses/knowledge_units/course_ku CSVs")
    p_tn.add_argument("--epochs",   type=int,   default=300)
    p_tn.add_argument("--lr",       type=float, default=0.001)
    p_tn.add_argument("--patience", type=int,   default=50)

    p_pn = sub.add_parser("predict_nlp",
                          help="Predict using course IDs (KU-aware NLP model)")
    p_pn.add_argument("--source",  type=int, required=True, help="Source course_id")
    p_pn.add_argument("--target",  type=int, required=True, help="Target course_id")
    p_pn.add_argument("--csv-dir", default=DEFAULT_CSV_DIR)

    p_ak = sub.add_parser("analyze_kus",
                          help="Show detailed KU overlap between two courses")
    p_ak.add_argument("--source",  type=int, required=True, help="Source course_id")
    p_ak.add_argument("--target",  type=int, required=True, help="Target course_id")
    p_ak.add_argument("--csv-dir", default=DEFAULT_CSV_DIR)

    # Legacy JSON-arg CLI (used by Express API)
    if len(sys.argv) >= 3 and sys.argv[1] in ("train","predict","status") \
            and sys.argv[2].startswith("{"):
        cmd     = sys.argv[1]
        payload = json.loads(sys.argv[2])
        try:
            if cmd == "train":
                result = train_model(
                    samples=payload.get("samples"),
                    epochs=payload.get("epochs", 300),
                    learning_rate=payload.get("learningRate", 0.001),
                )
            elif cmd == "predict":
                src = payload.get("source")
                tgt = payload.get("target")
                feats = payload.get("features")
                if src and tgt:
                    result = predict(source=src, target=tgt)
                elif feats:
                    result = predict(features=feats)
                else:
                    raise ValueError("Provide 'source'+'target' or 'features'")
            else:
                result = get_status()
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
        return

    args = parser.parse_args()

    if args.command == "train":
        samples = None
        if args.samples:
            with open(args.samples) as f:
                samples = json.load(f)
        result = train_model(samples=samples, epochs=args.epochs,
                             learning_rate=args.lr, patience=args.patience)
        print(json.dumps(result, indent=2))

    elif args.command == "predict":
        payload = json.loads(args.payload)
        src = payload.get("source")
        tgt = payload.get("target")
        feats = payload.get("features")
        if src and tgt:
            result = predict(source=src, target=tgt)
        elif feats:
            result = predict(features=feats)
        else:
            sys.exit("Provide 'source'+'target' or 'features' in JSON payload")
        print(json.dumps(result, indent=2))

    elif args.command == "status":
        print(json.dumps(get_status(), indent=2))

    elif args.command == "export":
        export_database(host=args.host, port=args.port, user=args.user,
                        password=args.password, database=args.database,
                        output_dir=args.output)

    elif args.command == "build_samples":
        samples = build_samples_from_csvs(csv_dir=args.csv_dir, output_path=args.output)
        if samples and args.retrain:
            retrain_via_api(samples, api_base=args.api, epochs=args.epochs)

    elif args.command == "train_nlp":
        result = train_nlp_model(
            csv_dir=args.csv_dir,
            epochs=args.epochs,
            learning_rate=args.lr,
            patience=args.patience,
        )
        print(json.dumps(result, indent=2))

    elif args.command == "predict_nlp":
        result = predict_nlp(
            src_course_id=args.source,
            tgt_course_id=args.target,
            csv_dir=args.csv_dir,
        )
        print(json.dumps(result, indent=2))

    elif args.command == "analyze_kus":
        result = analyze_kus(
            src_course_id=args.source,
            tgt_course_id=args.target,
            csv_dir=args.csv_dir,
        )
        print(json.dumps(result, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()