console.log("=== VARIABLES DE ENTORNO ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Configurada" : "❌ Faltante");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Configurado" : "❌ Faltante");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("============================"); 