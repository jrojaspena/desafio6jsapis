const input = document.getElementById('inputMonto');
const select = document.getElementById('selectMoneda');
const btnAgregar = document.getElementById('boton');
const graficoHtml = document.getElementById('myChart');
const resultadoMonto = document.getElementById('resultadoMoneda');
const urlHostAPiMonedas = 'https://mindicador.cl/api/';

let listadoMonedas = [];
let grafico;

const getJsonRespuestaDeApi = async (url, mensaje = 'No se pudo obtener los datos') => {
    try {
        const res = await fetch(url);
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
        alert(mensaje);
    }
}


async function getMonedas() {
    let respuesta = getJsonRespuestaDeApi(urlHostAPiMonedas);
    if (respuesta) {
        return respuesta
    }

    return getJsonRespuestaDeApi('./mindicador.json', 'No se pudo recolectar datos ');
}

// tranformar data
const transformarDataALista = async () => {
    const monedas = await getMonedas();
    return Object.values(monedas);
} 

const poblarDataSelect = async () => {
    const data = await transformarDataALista();
    listadoMonedas = data.filter((elemento) => typeof elemento == 'object');
    listadoMonedas.forEach((elemento, index) => agregarOptionEnSelect(index, elemento))
}

 
function agregarOptionEnSelect (index, {nombre}) {
    let html = `<option value="${index}">${nombre}</option>`
    select.innerHTML += html;
}


btnAgregar.addEventListener('click', (elemento) => {
    elemento.preventDefault();
    const valorInput = input.value;
    const indexOpcionSeleccionada = select.value;
    const {codigo, valor}= listadoMonedas[indexOpcionSeleccionada];
    resultadoMonto.innerHTML = 'CLP: ' + valorInput * valor;
    construirGrafico(codigo);
})


const limpiarPantalla = () => {
    if (grafico) {
        grafico.destroy();
    }
}
const construirGrafico = async(codigo) => {
    const urlHistorico = urlHostAPiMonedas + codigo;
    const respuesta = await getJsonRespuestaDeApi(urlHistorico, 'No se pudieron obtener datos ');
    const series = respuesta.serie.reverse();
    const fechas = [];
    const valores = [];
    let contador = 0;
    for (const serie of series) {
        if (contador == 10) {
            break;
        }
        fechas.push(serie.fecha);
        valores.push(serie.valor);
        contador++;
    }

    const configuracion = {
        type: 'line',
        data: {
          datasets: [{
            label: 'Historial últimos 10 días',
            data: valores,
          }],
          labels: fechas
        }
    }
    grafico = new Chart(graficoHtml, configuracion);
}


poblarDataSelect();
input.addEventListener('change', limpiarPantalla);
select.addEventListener('change', limpiarPantalla); 