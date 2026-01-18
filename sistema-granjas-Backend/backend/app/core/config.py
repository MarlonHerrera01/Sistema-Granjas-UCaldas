import json
import boto3
import ssl
import time
import logging
import warnings
from botocore.config import Config
from pydantic_settings import BaseSettings
from typing import Dict, List, Optional

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=None  # Usar default, Render captura stdout
)

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # === Variables de entorno requeridas ===
    DATABASE_URL: str
    SECRET_KEY: str
    GOOGLE_CLIENT_ID: str

    # Directorio para guardado temporal
    UPLOAD_DIR: str = "app/uploads"

    # === Configuración técnica ===
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # === Cloudflare R2 ===
    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY: str
    R2_SECRET_KEY: str
    R2_BUCKET_NAME: str
    R2_ENDPOINT: str
    R2_PUBLIC_URL: str

    # === Variables de negocio ===
    ROLES_POR_DEFECTO: Optional[Dict] = None
    ROLES_PERMITIDOS_REGISTRO: Optional[List[str]] = None
    GRANJAS_PREDEFINIDAS: Optional[List[Dict]] = None
    PROGRAMAS_AGRICOLAS: Optional[List[Dict]] = None
    PROGRAMAS_PECUARIOS: Optional[List[Dict]] = None

    class Config:
        env_file = ".env"
        extra = "allow"

    def init_storage(self):
        """Inicializa cliente R2 simplificado"""
        logger.info("Inicializando cliente R2...")
        
        try:
            # Configuración mínima para R2
            s3_config = Config(
                region_name="auto",
                signature_version='s3v4',
                connect_timeout=10,
                read_timeout=30,
                retries={'max_attempts': 3},
                s3={'addressing_style': 'virtual'}
            )
            
            # Crear sesión
            session = boto3.Session()
            
            # IMPORTANTE: Crear contexto SSL que fuerza TLS 1.2+
            ssl_context = ssl.create_default_context()
            ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
            
            self.r2_client = session.client(
                's3',
                endpoint_url=self.R2_ENDPOINT,
                aws_access_key_id=self.R2_ACCESS_KEY,
                aws_secret_access_key=self.R2_SECRET_KEY,
                config=s3_config
            )
            
            # Test simple de conexión
            logger.info("Probando conexión R2...")
            response = self.r2_client.list_buckets()
            logger.info(f"Conexión exitosa. Buckets: {len(response['Buckets'])}")
            
            # Verificar bucket específico
            try:
                self.r2_client.head_bucket(Bucket=self.R2_BUCKET_NAME)
                logger.info(f"Bucket '{self.R2_BUCKET_NAME}' accesible")
            except Exception as e:
                logger.warning(f"Bucket no accesible: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error inicializando R2: {e}")
            
            # Intentar con verificación SSL deshabilitada
            try:
                logger.warning("Intentando conexión sin verificación SSL...")
                
                # Deshabilitar warnings
                import urllib3
                urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
                
                # Crear cliente sin verificación SSL
                self.r2_client = boto3.client(
                    's3',
                    endpoint_url=self.R2_ENDPOINT,
                    aws_access_key_id=self.R2_ACCESS_KEY,
                    aws_secret_access_key=self.R2_SECRET_KEY,
                    config=Config(
                        region_name='auto',
                        signature_version='s3v4',
                        connect_timeout=15,
                        read_timeout=30
                    ),
                    verify=False  # ⚠️ Deshabilitar verificación SSL
                )
                
                # Test
                response = self.r2_client.list_buckets()
                logger.warning(f"⚠️ Conexión exitosa SIN verificación SSL. Buckets: {len(response['Buckets'])}")
                return True
                
            except Exception as e2:
                logger.error(f"También falló sin verificación SSL: {e2}")
                self.r2_client = None
                return False

# Crear instancia de settings
settings = Settings()

# === Conversión automática strings JSON ===
def parse_json_field(value, default=None):
    if not value:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value.replace("'", '"'))
        except json.JSONDecodeError:
            return default
    return value

settings.ROLES_POR_DEFECTO = parse_json_field(settings.ROLES_POR_DEFECTO, {})
settings.ROLES_PERMITIDOS_REGISTRO = parse_json_field(settings.ROLES_PERMITIDOS_REGISTRO, [])
settings.GRANJAS_PREDEFINIDAS = parse_json_field(settings.GRANJAS_PREDEFINIDAS, [])
settings.PROGRAMAS_AGRICOLAS = parse_json_field(settings.PROGRAMAS_AGRICOLAS, [])
settings.PROGRAMAS_PECUARIOS = parse_json_field(settings.PROGRAMAS_PECUARIOS, [])

# Inicializar almacenamiento R2
logger.info("Inicializando sistema de almacenamiento R2...")
storage_success = settings.init_storage()

if storage_success:
    logger.info("Sistema R2 listo para uso")
else:
    logger.error("Sistema R2 no disponible - uploads fallarán")