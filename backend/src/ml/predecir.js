const fs = require('fs');
const path = require('path');
const { RandomForestRegression } = require('ml-random-forest');
const MultivariateLinearRegression = require('ml-regression').MultivariateLinearRegression;
const { construirFeatures } = require('./preprocesamiento');

const ejecutarPrediccion = (rutaArchivoRelativa, filasEntrada) => {
  const rutaAbsoluta = path.join(__dirname, '..', '..', rutaArchivoRelativa);
  if (!fs.existsSync(rutaAbsoluta)) {
    throw new Error('El archivo físico del modelo entrenado no existe. Vuelve a entrenar el modelo.');
  }

  const contenido = JSON.parse(fs.readFileSync(rutaAbsoluta, 'utf-8'));
  const X = filasEntrada.map(construirFeatures);

  if (contenido.algoritmo === 'regresion_lineal') {
    const mlr = MultivariateLinearRegression.load(contenido.modelo);
    return X.map((x) => Math.max(1, Math.round(Math.expm1(mlr.predict(x)[0]))));
  } else {
    const rf = RandomForestRegression.load(contenido.modelo);
    return rf.predict(X).map((v) => Math.max(1, Math.round(v)));
  }
};

module.exports = { ejecutarPrediccion };
