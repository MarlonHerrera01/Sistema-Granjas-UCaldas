from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List

class TokenResponse(BaseModel):
    """Respuesta estándar para login o registro exitoso."""
    access_token: str
    token_type: str = "bearer"
    nombre: str
    rol: str
    rol_id: int
    email: EmailStr
    message: str | None = None 

class LoginRequest(BaseModel):
    """Modelo de solicitud para el login tradicional."""
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    """Modelo de solicitud para el registro tradicional."""
    nombre: str
    email: EmailStr
    password: str
    rol_id: int

    @field_validator('password')
    def validate_password_length(cls, v):
        """Valida que la longitud de la contraseña esté entre 6 y 100 caracteres."""
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        if len(v) > 100:
            raise ValueError('La contraseña no puede tener más de 100 caracteres')
        return v

class LogoutRequest(BaseModel):
    """Modelo de solicitud para el logout (opcional, si se pasa el token)."""
    token: Optional[str] = None

class UserVerification(BaseModel):
    """Modelo de respuesta para la verificación de token."""
    valid: bool
    user: dict
    
class SuccessMessage(BaseModel):
    """Modelo de respuesta para mensajes simples como logout."""
    message: str
    detail: Optional[str] = None

# --- Nuevos para Google OAuth (DEBEN ESTAR DEFINIDOS) ---

class GoogleLoginRequest(BaseModel):
    """Modelo de solicitud para el login con el token de Google ID."""
    token: str

class RoleInfo(BaseModel):
    """Modelo para la información de un rol."""
    id: int
    nombre: str
    descripcion: str

class RolesAvailableResponse(BaseModel):
    """Modelo de respuesta para los roles disponibles."""
    roles: List[RoleInfo]
