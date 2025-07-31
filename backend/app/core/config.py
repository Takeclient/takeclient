"""
Application configuration settings
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings
import os
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings
    """
    # App settings
    app_name: str = "CRM Backend"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./crm.db"
    database_test_url: str = Field("", env="DATABASE_TEST_URL")
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    secret_key: str = "your-super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = Field("production", env="ENVIRONMENT")
    
    # AI Services
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    pinecone_api_key: str = Field("", env="PINECONE_API_KEY")
    pinecone_environment: str = Field("", env="PINECONE_ENVIRONMENT")
    
    # Email
    smtp_server: str = Field("", env="SMTP_SERVER")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_username: str = Field("", env="SMTP_USERNAME")
    smtp_password: str = Field("", env="SMTP_PASSWORD")
    
    # Celery
    celery_broker_url: str = Field("redis://localhost:6379/1", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field("redis://localhost:6379/2", env="CELERY_RESULT_BACKEND")
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated origins to list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(",")]
        return self.allowed_origins
    
    # File Upload
    max_file_size: int = Field(10485760, env="MAX_FILE_SIZE")  # 10MB
    upload_dir: str = Field("./uploads", env="UPLOAD_DIR")
    
    # Google Ads Configuration
    google_ads_client_id: str = ""
    google_ads_client_secret: str = ""
    google_ads_developer_token: str = ""
    google_ads_refresh_token: str = ""
    google_ads_customer_id: str = ""
    google_api_key: str = ""
    google_oauth_redirect_uri: str = "http://localhost:3000/api/auth/google-ads/callback"
    
    # Meta (Facebook) Ads Configuration
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_access_token: str = ""
    meta_oauth_redirect_uri_prod: str = "https://takeclient.com/api/auth/meta/callback"
    meta_oauth_redirect_uri_dev: str = "http://localhost:3000/api/auth/meta/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings() 