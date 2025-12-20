"""
Utilidades para formatear DataFrames para Excel
"""
import pandas as pd
from typing import Dict, List

class DataFrameFormatter:
    """Clase para formatear DataFrames para exportación a Excel"""
    
    @staticmethod
    def format_dataframe(df: pd.DataFrame, title: str = "") -> pd.DataFrame:
        """Formatear DataFrame para Excel"""
        if df.empty:
            return pd.DataFrame({"Mensaje": ["No hay datos para mostrar"]})
        
        # Renombrar columnas para mejor legibilidad
        column_rename = {}
        for col in df.columns:
            if '_' in str(col):
                # Convertir snake_case a Title Case
                new_name = ' '.join(word.capitalize() for word in str(col).split('_'))
                column_rename[col] = new_name
            elif col.lower() == col:
                # Si está todo en minúscula, capitalizar
                column_rename[col] = str(col).capitalize()
        
        if column_rename:
            df = df.rename(columns=column_rename)
        
        # Ordenar columnas de forma lógica
        preferred_order = [
            'Id', 'Código', 'Nombre', 'Título', 'Descripción',
            'Tipo', 'Estado', 'Fecha Creación', 'Fecha Actualización',
            'Usuario', 'Email', 'Rol', 'Granja', 'Lote', 'Programa',
            'Cultivo', 'Cantidad', 'Unidad', 'Avance', 'Comentario'
        ]
        
        # Mantener solo las columnas que existen
        existing_cols = [col for col in preferred_order if col in df.columns]
        other_cols = [col for col in df.columns if col not in existing_cols]
        
        return df[existing_cols + other_cols]
    
    @staticmethod
    def create_resumen_dataframe(estadisticas: Dict) -> pd.DataFrame:
        """Crear DataFrame de resumen a partir de estadísticas"""
        data = []
        
        for metrica, valor in estadisticas.items():
            if isinstance(valor, dict):
                data.append({
                    'Métrica': metrica,
                    'Valor': valor.get('total', ''),
                    'Detalle': valor.get('detalle', '')
                })
            else:
                data.append({
                    'Métrica': metrica,
                    'Valor': valor,
                    'Detalle': ''
                })
        
        return pd.DataFrame(data)