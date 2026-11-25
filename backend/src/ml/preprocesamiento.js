const codificarTemporada = (nombreTemporada) => {
  const mapa = {
    'Normal': 0,
    'Fiestas Patrias': 1,
    'Navidad': 2,
    'Año Nuevo': 3,
  };
  return mapa[nombreTemporada] !== undefined ? mapa[nombreTemporada] : 4;
};

const construirFeatures = (fila) => {
  return [
    Number(fila.producto_id),
    Number(fila.dia_semana),
    Number(fila.mes),
    codificarTemporada(fila.temporada || 'Normal'),
    Number(fila.precio_venta),
  ];
};

const calcularMetricas = (reales, predichos) => {
  const n = reales.length;
  if (n === 0) return { mae: 0, rmse: 0, r2: 0 };

  let sumaErrorAbs = 0;
  let sumaErrorCuad = 0;
  const mediaReal = reales.reduce((acc, v) => acc + v, 0) / n;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const error = reales[i] - predichos[i];
    sumaErrorAbs += Math.abs(error);
    sumaErrorCuad += error * error;
    ssTot += Math.pow(reales[i] - mediaReal, 2);
  }

  const mae = Number((sumaErrorAbs / n).toFixed(4));
  const rmse = Number(Math.sqrt(sumaErrorCuad / n).toFixed(4));
  const r2 = ssTot === 0 ? 1 : Number(Math.max(0, 1 - sumaErrorCuad / ssTot).toFixed(4));

  return { mae, rmse, r2 };
};

module.exports = { codificarTemporada, construirFeatures, calcularMetricas };
