from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    currency: Optional[str] = None
    symbol: Optional[str] = None
    setupComplete: Optional[bool] = None
    initialBalance: Optional[int] = None