from .meta import router as meta_router
from .patients import router as patients_router
from .twin import router as twin_router
from .predictions import router as predictions_router
from .scenarios import router as scenarios_router
from .signals import router as signals_router
from .alerts import router as alerts_router
from .simulation import router as simulation_router

__all__ = [
    "meta_router",
    "patients_router",
    "twin_router",
    "predictions_router",
    "scenarios_router",
    "signals_router",
    "alerts_router",
    "simulation_router",
]
