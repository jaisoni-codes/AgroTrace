import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_evidence_packet(
    case_data: Dict[str, Any],
    output_dir: Path
) -> Dict[str, Any]:
    """
    Produces deterministic EvidencePacket JSON + PDF with SHA-256 hash.
    Every number shown is strictly from tool output.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    case_id = case_data["case_id"]

    # Canonical JSON string for hash
    json_bytes = json.dumps(case_data, sort_keys=True, indent=2).encode("utf-8")
    sha256_hash = hashlib.sha256(json_bytes).hexdigest()

    case_data["provenance"]["sha256"] = sha256_hash
    case_data["provenance"]["generated_at"] = datetime.utcnow().isoformat() + "Z"

    # Save JSON
    json_path = output_dir / f"{case_id}_packet.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(case_data, f, indent=2, ensure_ascii=False)

    # Generate Evidence PDF
    pdf_path = output_dir / f"{case_id}_packet.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 50, "AgroTrace - Satellite Witness Evidence Packet")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 68, "Pradhan Mantri Fasal Bima Yojana (PMFBY) Localized Claim Triage")
    c.setStrokeColor(colors.HexColor("#1F5C45"))
    c.setLineWidth(2)
    c.line(50, height - 76, width - 50, height - 76)

    # Metadata & Verdict Stamp
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 105, f"Case ID: {case_id}")
    c.drawString(250, height - 105, f"Peril: {case_data.get('peril', '').upper()}")
    c.drawString(400, height - 105, f"Claim Date: {case_data.get('claimed_event_date', '')}")

    triage = case_data.get("triage", "REVIEW_FLAG")
    stamp_color = colors.HexColor("#1F6B45") if triage == "FAST_TRACK" else (colors.HexColor("#8A5A00") if triage == "SURVEYOR_VISIT" else colors.HexColor("#9C3A2E"))
    c.setFillColor(stamp_color)
    c.rect(50, height - 145, 200, 26, stroke=1, fill=0)
    c.drawString(60, height - 138, f"VERDICT: {triage.replace('_', ' ')}")

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 170, "1. Plot & Damage Summary")
    c.setFont("Helvetica", 10)
    analysis = case_data.get("analysis", {})
    plot = case_data.get("plot", {})
    c.drawString(60, height - 188, f"- Farm Area: {plot.get('area_ha', 0.0)} ha")
    c.drawString(60, height - 204, f"- Measured Plot Damage: {analysis.get('damage_pct', 0.0)} % (90% CI: {analysis.get('damage_ci', [0, 0])[0]}% - {analysis.get('damage_ci', [0, 0])[1]}%)")
    c.drawString(60, height - 220, f"- Pre-Event NDVI: {analysis.get('ndvi_pre', 0.0)}  -->  Post-Event NDVI: {analysis.get('ndvi_post', 0.0)}")
    c.drawString(60, height - 236, f"- Difference-in-Differences vs Controls: z = {analysis.get('z_vs_controls', 0.0)} (Controls mean change: {analysis.get('control_change_mean', 0.0)})")

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 265, "2. Event Verification (Weather Analysis)")
    c.setFont("Helvetica", 10)
    event_v = case_data.get("event_verification", {})
    metrics = event_v.get("metrics", {})
    c.drawString(60, height - 283, f"- Source: {event_v.get('source', '')}")
    c.drawString(60, height - 299, f"- 7-Day Cumulative Rainfall: {metrics.get('precip_7d_mm', 0.0)} mm (Percentile: {metrics.get('precip_percentile', 0.0)}%)")
    c.drawString(60, height - 315, f"- Verification Status: {'CONFIRMED' if event_v.get('supports_claim') else 'NO SEVERE ANOMALY'}")

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 345, "3. Consistency & Quality Checks")
    c.setFont("Helvetica", 10)
    checks = case_data.get("checks", {})
    c.drawString(60, height - 363, f"- Event-Date Correlation: {checks.get('event_date_match', 'N/A').upper()} - {checks.get('event_date_reason', '')}")
    c.drawString(60, height - 379, f"- Pre-Event Crop Signal: {checks.get('crop_signal', 'N/A').upper()} - {checks.get('crop_signal_reason', '')}")
    c.drawString(60, height - 395, f"- Insured Area Consistency: {checks.get('area_ok', 'N/A').upper()} - {checks.get('area_ok_reason', '')}")

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 425, "4. Farmer Summary (Hindi)")
    c.setFont("Helvetica", 10)
    farmer_s = case_data.get("farmer_summary", {}).get("text", "")
    c.drawString(60, height - 445, farmer_s[:95] if len(farmer_s) > 95 else farmer_s)
    if len(farmer_s) > 95:
        c.drawString(60, height - 460, farmer_s[95:190])

    # Provenance Footer & Hash
    c.setStrokeColor(colors.HexColor("#D8D3C3"))
    c.setLineWidth(1)
    c.line(50, 95, width - 50, 95)
    c.setFont("Helvetica", 8)
    c.drawString(50, 80, f"SHA-256 Fingerprint: {sha256_hash}")
    c.drawString(50, 68, f"Generated At: {case_data['provenance']['generated_at']} | Engines: Rasterio, PySTAC, Planetary Computer")
    c.drawString(50, 56, "Notice: This document provides objective satellite-derived decision support under PMFBY guidelines.")

    c.save()

    return {
        "json_path": str(json_path),
        "pdf_path": str(pdf_path),
        "sha256": sha256_hash
    }
