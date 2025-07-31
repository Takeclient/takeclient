"""
Users endpoints
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class User(BaseModel):
    id: str
    email: str
    name: str
    is_active: bool = True


class UserCreate(BaseModel):
    email: str
    name: str
    password: str


@router.get("/", response_model=List[User])
async def get_users():
    """
    Get all users
    """
    # TODO: Implement actual user fetching from database
    return [
        User(id="1", email="admin@example.com", name="Admin User"),
        User(id="2", email="user@example.com", name="Regular User"),
    ]


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """
    Get user by ID
    """
    # TODO: Implement actual user fetching from database
    return User(id=user_id, email="user@example.com", name="User Name")


@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    """
    Create new user
    """
    # TODO: Implement actual user creation in database
    return User(
        id="new_user_id",
        email=user.email,
        name=user.name
    )


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user: UserCreate):
    """
    Update user
    """
    # TODO: Implement actual user update in database
    return User(
        id=user_id,
        email=user.email,
        name=user.name
    )


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """
    Delete user
    """
    # TODO: Implement actual user deletion from database
    return {"message": f"User {user_id} deleted successfully"} 