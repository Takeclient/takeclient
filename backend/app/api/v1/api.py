"""
Main API router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, agents
from app.api.v1 import google_ads, meta_ads

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(agents.router, prefix="/agents", tags=["ai-agents"])
api_router.include_router(google_ads.router, tags=["google-ads"])
api_router.include_router(meta_ads.router, tags=["meta-ads"]) 