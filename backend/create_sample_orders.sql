-- Script para crear pedidos de prueba para el dashboard
-- Pedidos sin direcciones (pickup/local)

-- Insertar algunos pedidos de los últimos días
INSERT INTO pedidos (numero_pedido, usuario_id, estado_pedido_id, metodo_pago_id, direccion_id, subtotal, impuestos, descuento, total, fecha_pedido, tipo_entrega, notas, created_at, updated_at) VALUES
-- Pedidos de hoy
('ORD-001', 1, 1, 1, NULL, 25000, 4000, 0, 29000, CURRENT_DATE + INTERVAL '8 hours', 'local', 'Pedido de prueba 1', NOW(), NOW()),
('ORD-002', 2, 2, 2, NULL, 18500, 2960, 0, 21460, CURRENT_DATE + INTERVAL '10 hours', 'takeaway', 'Pedido de prueba 2', NOW(), NOW()),
('ORD-003', 3, 3, 1, NULL, 32000, 5120, 0, 37120, CURRENT_DATE + INTERVAL '12 hours', 'local', 'Pedido de prueba 3', NOW(), NOW()),

-- Pedidos de ayer
('ORD-004', 1, 5, 3, NULL, 15000, 2400, 0, 17400, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours', 'takeaway', 'Pedido de ayer 1', NOW(), NOW()),
('ORD-005', 2, 5, 1, NULL, 28000, 4480, 0, 32480, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours', 'local', 'Pedido de ayer 2', NOW(), NOW()),
('ORD-006', 3, 4, 2, NULL, 22000, 3520, 0, 25520, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours', 'local', 'Pedido de ayer 3', NOW(), NOW()),

-- Pedidos de hace 2 días
('ORD-007', 1, 5, 1, NULL, 19500, 3120, 0, 22620, CURRENT_DATE - INTERVAL '2 days' + INTERVAL '11 hours', 'local', 'Pedido hace 2 días 1', NOW(), NOW()),
('ORD-008', 2, 5, 3, NULL, 26500, 4240, 0, 30740, CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours', 'takeaway', 'Pedido hace 2 días 2', NOW(), NOW()),

-- Pedidos de hace 3 días
('ORD-009', 3, 5, 2, NULL, 31000, 4960, 0, 35960, CURRENT_DATE - INTERVAL '3 days' + INTERVAL '10 hours', 'takeaway', 'Pedido hace 3 días 1', NOW(), NOW()),
('ORD-010', 1, 5, 1, NULL, 17500, 2800, 0, 20300, CURRENT_DATE - INTERVAL '3 days' + INTERVAL '15 hours', 'local', 'Pedido hace 3 días 2', NOW(), NOW()),

-- Pedidos de hace una semana
('ORD-011', 2, 5, 3, NULL, 23500, 3760, 0, 27260, CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours', 'local', 'Pedido semana pasada 1', NOW(), NOW()),
('ORD-012', 3, 5, 1, NULL, 29000, 4640, 0, 33640, CURRENT_DATE - INTERVAL '7 days' + INTERVAL '17 hours', 'local', 'Pedido semana pasada 2', NOW(), NOW()),

-- Pedidos del mes pasado
('ORD-013', 1, 5, 2, NULL, 21000, 3360, 0, 24360, CURRENT_DATE - INTERVAL '15 days' + INTERVAL '9 hours', 'takeaway', 'Pedido mes pasado 1', NOW(), NOW()),
('ORD-014', 2, 5, 1, NULL, 27500, 4400, 0, 31900, CURRENT_DATE - INTERVAL '20 days' + INTERVAL '14 hours', 'local', 'Pedido mes pasado 2', NOW(), NOW()),
('ORD-015', 3, 5, 3, NULL, 33000, 5280, 0, 38280, CURRENT_DATE - INTERVAL '25 days' + INTERVAL '11 hours', 'local', 'Pedido mes pasado 3', NOW(), NOW());

-- Ahora insertar detalles de pedido para algunos pedidos
-- Detalles para pedido 1 (25000 de subtotal)
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 2, 2, 12500, 25000); -- 2 Americanos

-- Detalles para pedido 2 (18500 de subtotal)
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(2, 3, 1, 8500, 8500),  -- 1 Latte
(2, 4, 1, 10000, 10000); -- 1 Cappuccino

-- Detalles para pedido 3 (32000 de subtotal)
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(3, 5, 2, 16000, 32000); -- 2 Mocha

-- Detalles para pedido 4 (15000 de subtotal)
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(4, 6, 1, 15000, 15000); -- 1 Macchiato

-- Detalles para pedido 5 (28000 de subtotal)
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(5, 7, 2, 14000, 28000); -- 2 Frappe

-- Insertar historial de estados para algunos pedidos
INSERT INTO historial_estado_pedido (pedido_id, estado_pedido_id, fecha_cambio, comentario) VALUES
-- Historial para pedido 1
(1, 1, CURRENT_DATE + INTERVAL '8 hours', 'Pedido recibido'),

-- Historial para pedido 2
(2, 1, CURRENT_DATE + INTERVAL '10 hours', 'Pedido recibido'),
(2, 2, CURRENT_DATE + INTERVAL '10 hours 15 minutes', 'Pedido confirmado'),

-- Historial para pedido 3
(3, 1, CURRENT_DATE + INTERVAL '12 hours', 'Pedido recibido'),
(3, 2, CURRENT_DATE + INTERVAL '12 hours 10 minutes', 'Pedido confirmado'),
(3, 3, CURRENT_DATE + INTERVAL '12 hours 20 minutes', 'En preparación'),

-- Historial para pedidos completados
(4, 1, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours', 'Pedido recibido'),
(4, 2, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 10 minutes', 'Pedido confirmado'),
(4, 3, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 20 minutes', 'En preparación'),
(4, 4, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 35 minutes', 'Listo'),
(4, 5, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 45 minutes', 'Entregado'); 