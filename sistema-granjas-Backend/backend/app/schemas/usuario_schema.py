from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol_id: int

class UsuarioCreate(UsuarioBase):
    password: Optional[str] = None  # Opcional para compatibilidad

class UsuarioCreateWithPassword(UsuarioBase):
    password: str  # Requerido para registro tradicional

    @field_validator('password')
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol_id: Optional[int] = None

class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    fecha_creacion: datetime
    rol_nombre: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    nombre: str
    rol: str
    rol_id: int
    email: str

class GoogleAuthRequest(BaseModel):
    token: str

class GoogleRegisterRequest(BaseModel):
    token: str
    rol_id: int