from fastapi import APIRouter

from app.api.routes import auth, contact, content

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(content.router)
api_router.include_router(contact.router)
