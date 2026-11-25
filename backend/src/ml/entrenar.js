const fs = require('fs');
const path = require('path');
const { RandomForestRegression } = require('ml-random-forest');
const MultivariateLinearRegression = require('ml-regression').MultivariateLinearRegression;
const { construirFeatures, calcularMetricas } = require('./preprocesamiento');

const entrenarModelo = (datosHistoricos, algoritmo = 'random_forest') => {
  if (!datosHistoricos || datosHistoricos.length < 10) {
    throw new Error('Se requieren al menos 10 registros diarios históricos para entrenar el modelo.');
  }

  const datos = [...datosHistoricos].sort(() => Math.random() - 0.5);
  const corte = Math.max(1, Math.floor(datos.length * 0.8));
  const trainSet = datos.slice(0, corte);
  const testSet = datos.slice(corte).length > 0 ? datos.slice(corte) : trainSet;

  const X_train = trainSet.map(construirFeatures);
  const y_train = trainSet.map((d) => Number(d.cantidad_vendida));

  const X_test = testSet.map(construirFeatures);
  const y_test = testSet.map((d) => Number(d.cantidad_vendida));

  let modeloSerializado;
  let prediccionesTest = [];

  if (algoritmo === 'regresion_lineal') {
    const y_train_log = y_train.map((v) => [Math.log1p(v)]);
    const mlr = new MultivariateLinearRegression(X_train, y_train_log);
    prediccionesTest = X_test.map((x) => Math.max(0, Math.round(Math.expm1(mlr.predict(x)[0]))));
    modeloSerializado = { algoritmo: 'regresion_lineal', modelo: mlr.toJSON() };
  } else {
    const rf = new RandomForestRegression({
      seed: 42,
      maxFeatures: 3,
      replacement: true,
      nEstimators: 40,
    });
    rf.train(X_train, y_train);
    prediccionesTest = rf.predict(X_test).map((v) => Math.max(0, Math.round(v)));
    modeloSerializado = { algoritmo: 'random_forest', modelo: rf.toJSON() };
  }

  const metricas = calcularMetricas(y_test, prediccionesTest);

  const dirModelos = path.join(__dirname, 'modelos');
  if (!fs.existsSync(dirModelos)) {
    fs.mkdirSync(dirModelos, { recursive: true });
  }

  const nombreArchivo = `modelo_${algoritmo}_${Date.now()}.json`;
  const rutaCompleta = path.join(dirModelos, nombreArchivo);
  fs.writeFileSync(rutaCompleta, JSON.stringify(modeloSerializado));

  return {
    algoritmo,
    metricas,
    rutaArchivo: `src/ml/modelos/${nombreArchivo}`,
    totalFilas: datosHistoricos.length,
  };
};

module.exports = { entrenarModelo };
