from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://fashionstore:fashionstore@db:5432/fashionstore"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    admin_username: str = "admin"
    admin_password: str = "admin123"

    frontend_url: str = "http://localhost:5173"

    resend_api_key: str = ""
    email_from: str = "orders@brandbagsandmore.com"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
