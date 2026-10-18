from typing import List
from pydantic import Field
from .common import BaseSchema


class CascadeNode(BaseSchema):
    node_index: int = Field(..., description="Chronological node sequence (1 to 4)")
    node_tag: str = Field(..., description="Badge tag (e.g. 'Node 01 · Ingestion Lapse')")
    title: str = Field(..., description="Short title (e.g. 'Missed Doses')")
    subtitle: str = Field(..., description="Context subtitle (e.g. 'Amlodipine 5mg omitted')")
    metric_label: str = Field(..., description="Primary parameter label (e.g. 'Cumulative Interval')")
    metric_value: str = Field(..., description="Primary parameter value (e.g. '~36h lapse')")
    phase_label: str = Field(..., description="Progression phase (e.g. 'Wash-out phase')")
    icon_name: str = Field(..., description="Material symbol icon identifier")


class ShapContribution(BaseSchema):
    feature_name: str = Field(..., description="Input feature name")
    contribution_value: float = Field(..., description="SHAP attribution value (signed)")
    direction: str = Field(..., description="'increases_risk' or 'decreases_risk'")
    category: str = Field(..., description="Category: Medication, Environment, Autonomic, Hemodynamic, EHR")


class ExplanationResponse(BaseSchema):
    patient_id: str = Field(..., description="Patient identifier")
    primary_alert_level: str = Field(
        default="Stage 3 Crisis Risk · Within 6h: 31% / 12h: 48%",
        description="High level alert summary"
    )
    biophysical_synthesis: str = Field(
        ...,
        description="Clinical narrative synthesis explaining the causal progression"
    )
    simulation_confidence_percent: float = Field(default=94.2, description="Simulation confidence percentage")
    windkessel_biofit_label: str = Field(
        default="Windkessel Bio-fit Nominal (ΔTDI 0.14)",
        description="Physiological fit confirmation"
    )
    pathway_nature: str = Field(
        default="Non-causal associative pathway derivation",
        description="Methodological transparency disclosure"
    )
    cascade_nodes: List[CascadeNode] = Field(..., description="4-step progression cascade")
    shap_contributions: List[ShapContribution] = Field(..., description="Feature attribution scores")
    recommended_clinical_action: str = Field(
        ...,
        description="Actionable, non-prescriptive clinical decision support recommendation"
    )
