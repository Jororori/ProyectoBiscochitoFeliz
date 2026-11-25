INSERT INTO roles (nombre) VALUES
    ('Administrador'),
    ('Empleado')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Panes', 'Panes tradicionales y artesanales de consumo diario'),
    ('Tortas', 'Tortas enteras y porciones de pastelería'),
    ('Empanadas', 'Empanadas horneadas dulces y saladas'),
    ('Postres', 'Postres individuales y bocaditos')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('algoritmo_activo', 'random_forest', 'Algoritmo por defecto para predicción de demanda'),
    ('margen_seguridad_porcentaje', '5', 'Porcentaje extra sugerido sobre la predicción para evitar quiebre de stock'),
    ('nombre_negocio', 'Panadería Biscochito Feliz', 'Nombre comercial mostrado en reportes')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO temporadas (nombre, fecha_inicio, fecha_fin) VALUES
    ('Fiestas Patrias', '2026-07-27', '2026-07-30'),
    ('Navidad', '2026-12-20', '2026-12-26'),
    ('Año Nuevo', '2026-12-30', '2027-01-02');

INSERT INTO productos (nombre, categoria_id, precio_venta, costo_produccion) VALUES
    ('Pan Francés', 1, 0.30, 0.12),
    ('Pan Ciabatta', 1, 0.50, 0.22),
    ('Pan Yema', 1, 0.40, 0.18),
    ('Empanada de Pollo', 3, 4.50, 1.90),
    ('Empanada de Carne', 3, 5.00, 2.20),
    ('Torta Tres Leches (Porción)', 2, 8.50, 3.80),
    ('Pie de Limón (Porción)', 4, 7.00, 3.10);