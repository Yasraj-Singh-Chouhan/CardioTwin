import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    meta_router,
    patients_router,
    twin_router,
    predictions_router,
    scenarios_router,
    signals_router,
    alerts_router,
    simulation_router,
)

from contextlib import asynccontextmanager
from app.services.fast_twin import get_models
from app.services.data_loader import load_baselines


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload models and baseline dictionary so all endpoints respond instantly
    get_models()
    load_baselines()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes mounted under /api per project specification
app.include_router(meta_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(twin_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(scenarios_router, prefix=settings.API_PREFIX)
app.include_router(signals_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)

# Also expose direct websocket for clients connecting to /ws/patients/{id}
app.include_router(simulation_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_prefix": settings.API_PREFIX,
        "health": f"{settings.API_PREFIX}/health",
        "datasheet": f"{settings.API_PREFIX}/datasheet",
    }
