const calcularDigitoVerificador = (doceDigitos) => {
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = parseInt(doceDigitos[i], 10);
    suma += digito * (i % 2 === 0 ? 1 : 3);
  }
  const resto = suma % 10;
  return resto === 0 ? 0 : 10 - resto;
};

const generarCodigoInterno = (productoId) => {
  const prefijo = '20';
  const idStr = String(productoId).padStart(10, '0');
  const doce = prefijo + idStr;
  const dv = calcularDigitoVerificador(doce);
  return doce + String(dv);
};

module.exports = { generarCodigoInterno };
