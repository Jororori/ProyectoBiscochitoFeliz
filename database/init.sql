-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) UNIQUE NOT NULL,
    descripcion VARCHAR(255)
);

-- 4. Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    precio_venta NUMERIC(10, 2) NOT NULL,
    costo_produccion NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ventas (Cabecera)
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Detalle de Ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 7. Insumos
CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_actual NUMERIC(12, 3) NOT NULL DEFAULT 0,
    stock_minimo NUMERIC(12, 3) NOT NULL DEFAULT 0,
    costo_unitario NUMERIC(10, 2) NOT NULL
);

-- 8. Recetas por Producto (N-N productos <-> insumos)
CREATE TABLE IF NOT EXISTS recetas_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    insumo_id INTEGER NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad_requerida NUMERIC(12, 4) NOT NULL,
    UNIQUE(producto_id, insumo_id)
);

-- 9. Temporadas
CREATE TABLE IF NOT EXISTS temporadas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- 10. Modelos ML
CREATE TABLE IF NOT EXISTS modelos_ml (
    id SERIAL PRIMARY KEY,
    algoritmo VARCHAR(30) NOT NULL, -- 'regresion_lineal', 'random_forest', 'red_neuronal'
    fecha_entrenamiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metrica_mae NUMERIC(12, 4),
    metrica_rmse NUMERIC(12, 4),
    metrica_r2 NUMERIC(8, 4),
    activo BOOLEAN DEFAULT FALSE,
    ruta_archivo VARCHAR(255) NOT NULL
);

-- 11. Predicciones
CREATE TABLE IF NOT EXISTS predicciones (
    id SERIAL PRIMARY KEY,
    fecha_prediccion DATE NOT NULL,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad_estimada INTEGER NOT NULL,
    modelo_id INTEGER NOT NULL REFERENCES modelos_ml(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Producción
CREATE TABLE IF NOT EXISTS produccion (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad_recomendada INTEGER NOT NULL,
    cantidad_producida INTEGER NOT NULL,
    cantidad_sobrante INTEGER NOT NULL DEFAULT 0,
    prediccion_id INTEGER REFERENCES predicciones(id) ON DELETE SET NULL
);

-- 13. Configuración
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(60) UNIQUE NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255)
);

-- Vista v_demanda_diaria (Sección 3.5: cruza ventas diarias, día de semana y temporada o 'Normal')
CREATE OR REPLACE VIEW v_demanda_diaria AS
SELECT
    v.fecha,
    EXTRACT(DOW FROM v.fecha)::INTEGER AS dia_semana,
    EXTRACT(MONTH FROM v.fecha)::INTEGER AS mes,
    COALESCE(t.nombre, 'Normal') AS temporada,
    dv.producto_id,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.precio_venta,
    SUM(dv.cantidad)::INTEGER AS cantidad_vendida
FROM ventas v
JOIN detalle_ventas dv ON dv.venta_id = v.id
JOIN productos p ON p.id = dv.producto_id
JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN temporadas t ON v.fecha BETWEEN t.fecha_inicio AND t.fecha_fin
GROUP BY v.fecha, dv.producto_id, p.nombre, c.nombre, p.precio_venta, t.nombre;