from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

# Tablas pivote para relaciones N-N
usuario_granja = Table(
    'usuario_granja',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id')),
    Column('granja_id', Integer, ForeignKey('granjas.id'))
)

granja_programa = Table(
    'granja_programa',
    Base.metadata,
    Column('granja_id', Integer, ForeignKey('granjas.id')),
    Column('programa_id', Integer, ForeignKey('programas.id'))
)

usuario_programa = Table(
    'usuario_programa',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id')),
    Column('programa_id', Integer, ForeignKey('programas.id'))
)

class Rol(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text)
    nivel_permiso = Column(Integer, default=0)
    activo = Column(Boolean, default=True)
    
    usuarios = relationship("Usuario", back_populates="rol")

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    activo = Column(Boolean, default=True)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(50), default="traditional")  # NUEVO: 'traditional' o 'google'
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    rol = relationship("Rol", back_populates="usuarios")
    granjas = relationship("Granja", secondary=usuario_granja, back_populates="usuarios")
    programas = relationship("Programa", secondary=usuario_programa, back_populates="usuarios")
    labores_asignadas = relationship("Labor", back_populates="trabajador")
    recomendaciones_generadas = relationship("Recomendacion", back_populates="docente")

class Programa(Base):
    __tablename__ = "programas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    tipo = Column(String(50), nullable=False)  # 'agricola' o 'pecuario'
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    granjas = relationship("Granja", secondary=granja_programa, back_populates="programas")
    usuarios = relationship("Usuario", secondary=usuario_programa, back_populates="programas")
    lotes = relationship("Lote", back_populates="programa")
    insumos = relationship("Insumo", back_populates="programa")

class Granja(Base):
    __tablename__ = "granjas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ubicacion = Column(String(150), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones N-N
    usuarios = relationship("Usuario", secondary=usuario_granja, back_populates="granjas")
    programas = relationship("Programa", secondary=granja_programa, back_populates="granjas")
    
    # Relaciones 1-N
    lotes = relationship("Lote", back_populates="granja")

class TipoLote(Base):
    __tablename__ = "tipos_lote"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)  # 'Lote' o 'Galpon'
    descripcion = Column(String(255))

class Lote(Base):
    __tablename__ = "lotes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo_lote_id = Column(Integer, ForeignKey("tipos_lote.id"))
    granja_id = Column(Integer, ForeignKey("granjas.id"))
    programa_id = Column(Integer, ForeignKey("programas.id"))
    
    # Datos del cultivo/especie
    nombre_cultivo = Column(String(100))
    tipo_gestion = Column(String(100))
    fecha_inicio = Column(DateTime)
    duracion_dias = Column(Integer)
    estado = Column(String(50), default="activo")
    
    # Relaciones
    tipo_lote = relationship("TipoLote")
    granja = relationship("Granja", back_populates="lotes")
    programa = relationship("Programa", back_populates="lotes")
    labores = relationship("Labor", back_populates="lote")

class CategoriaInventario(Base):
    __tablename__ = "categorias_inventario"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)  # 'herramienta' o 'insumo'
    descripcion = Column(String(255))

class Herramienta(Base):
    __tablename__ = "herramientas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    categoria_id = Column(Integer, ForeignKey("categorias_inventario.id"))
    cantidad_total = Column(Integer, default=0)
    cantidad_disponible = Column(Integer, default=0)
    estado = Column(String(50), default="disponible")
    
    categoria = relationship("CategoriaInventario")
    movimientos = relationship("MovimientoHerramienta", back_populates="herramienta")

class Insumo(Base):
    __tablename__ = "insumos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    programa_id = Column(Integer, ForeignKey("programas.id"))
    cantidad_total = Column(Float, default=0.0)
    cantidad_disponible = Column(Float, default=0.0)
    unidad_medida = Column(String(50))
    nivel_alerta = Column(Float, default=0.0)  # Nivel para generar alertas
    estado = Column(String(50), default="disponible")
    
    programa = relationship("Programa", back_populates="insumos")
    movimientos = relationship("MovimientoInsumo", back_populates="insumo")

class TipoLabor(Base):
    __tablename__ = "tipos_labor"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))

class Labor(Base):
    __tablename__ = "labores"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    tipo_labor_id = Column(Integer, ForeignKey("tipos_labor.id"))
    lote_id = Column(Integer, ForeignKey("lotes.id"))
    trabajador_id = Column(Integer, ForeignKey("usuarios.id"))  # Trabajador asignado
    recomendacion_id = Column(Integer, ForeignKey("recomendaciones.id"))
    
    # Estado y fechas
    estado = Column(String(50), default="pendiente")  # pendiente, en_progreso, completada, cancelada
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_asignacion = Column(DateTime)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    prioridad = Column(String(20), default="media")  # baja, media, alta
    
    # Relaciones
    tipo_labor = relationship("TipoLabor")
    lote = relationship("Lote", back_populates="labores")
    trabajador = relationship("Usuario", back_populates="labores_asignadas")
    recomendacion = relationship("Recomendacion", back_populates="labores")
    uso_herramientas = relationship("MovimientoHerramienta", back_populates="labor")
    uso_insumos = relationship("MovimientoInsumo", back_populates="labor")

class Recomendacion(Base):
    __tablename__ = "recomendaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text)
    docente_id = Column(Integer, ForeignKey("usuarios.id"))  # Docente que genera la recomendación
    lote_id = Column(Integer, ForeignKey("lotes.id"))
    
    # Estado
    estado = Column(String(50), default="pendiente")  # pendiente, aprobada, rechazada, completada
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_aprobacion = Column(DateTime)
    
    # Relaciones
    docente = relationship("Usuario", back_populates="recomendaciones_generadas")
    lote = relationship("Lote")
    labores = relationship("Labor", back_populates="recomendacion")

class MovimientoHerramienta(Base):
    __tablename__ = "movimientos_herramientas"
    
    id = Column(Integer, primary_key=True, index=True)
    herramienta_id = Column(Integer, ForeignKey("herramientas.id"))
    labor_id = Column(Integer, ForeignKey("labores.id"))
    cantidad = Column(Integer, nullable=False)
    tipo_movimiento = Column(String(50), nullable=False)  # 'prestamo', 'devolucion', 'mantenimiento'
    fecha_movimiento = Column(DateTime, default=datetime.utcnow)
    observaciones = Column(Text)
    
    herramienta = relationship("Herramienta", back_populates="movimientos")
    labor = relationship("Labor", back_populates="uso_herramientas")

class MovimientoInsumo(Base):
    __tablename__ = "movimientos_insumos"
    
    id = Column(Integer, primary_key=True, index=True)
    insumo_id = Column(Integer, ForeignKey("insumos.id"))
    labor_id = Column(Integer, ForeignKey("labores.id"))
    cantidad = Column(Float, nullable=False)
    tipo_movimiento = Column(String(50), nullable=False)  # 'uso', 'reabastecimiento', 'ajuste'
    fecha_movimiento = Column(DateTime, default=datetime.utcnow)
    observaciones = Column(Text)
    
    insumo = relationship("Insumo", back_populates="movimientos")
    labor = relationship("Labor", back_populates="uso_insumos")