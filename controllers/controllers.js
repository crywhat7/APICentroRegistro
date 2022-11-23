// Instalamos los modulos necesarios
const fs = require('fs-extra');

// Constantes de las rutas de los archivos
const ruta = `${__dirname}/../assets/Personas.txt`;
const rutaDisponibles = `${__dirname}/../assets/Disponibles.txt`;
const rutaPartidasNacimiento = `${__dirname}/../assets/Nacimientos.txt`;
const rutaTarjetasIdentidades = `${__dirname}/../assets/Identidades.txt`;

// Constante del registro eliminado
const eliminado = '#';

// ! PERSONAS ! //

// ! Método que obtiene las lineas del archivo Personas.txt
function getLineas() {
  try {
    const text = fs.readFileSync(ruta, 'utf8');
    return text.split('\n').filter((linea) => linea);
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ! Método que obtiene las personas del archivo mapeadas a objetos
function getPersonas() {
  try {
    const text = fs.readFileSync(ruta, 'utf8');
    const jsonText = createJSON(text);
    return jsonText;
  } catch (error) {
    console.log(error);
  }
}

// ! Método que agrega una persona al archivo Personas.txt
function addPersona(persona) {
  const podemos = verificarSiPodemosEscribir();
  if (!podemos.ok) {
    return {
      ok: false,
      message: podemos.message,
    };
  }
  try {
    const record = createRecord(persona);
    fs.appendFileSync(ruta, record);
    const xd = getLineas();
    const posicionLinea = xd.findIndex((linea) => linea + '\n' === record) + 1;
    registrarNoDisponible(posicionLinea);
    return { ok: true, message: 'Persona agregada' };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: `No se pudo agregar la persona, Error: ${error}`,
    };
  }
}

// ! Método que marca un registro como eliminado
function deletePersona(numeroIdentidad) {
  try {
    const personas = getLineas();
    let personaAEliminar;
    let newText = '';
    let posicionLinea = -1;
    personas.forEach((persona) => {
      if (persona === eliminado || persona.includes(numeroIdentidad)) {
        if (persona.includes(numeroIdentidad)) {
          personaAEliminar = persona;
          const xd = getLineas();
          posicionLinea =
            xd.findIndex((linea) => linea === personaAEliminar) + 1;
        }
        newText += eliminado + '\n';
      } else {
        newText += persona + '\n';
      }
    });

    fs.writeFileSync(ruta, newText);
    registrarDisponible(posicionLinea);
    return { ok: true, message: 'Persona eliminada' };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: `No se pudo eliminar la persona, Error: ${error}`,
    };
  }
}

// ! Método que se encarga de obtener la información de una persona según su número de identidad
function obtenerInformacionSegunId(numeroIdentidad) {
  const personas = getLineas();
  const persona = personas.find((persona) => {
    const fields = persona.split(';');
    return fields[0] === numeroIdentidad;
  });

  if (persona) {
    const fields = persona.split(';');
    const personaRetornar = {
      numeroIdentidad: fields[0].replace('\n', '').trim(),
      primerNombre: fields[1].trim(),
      segundoNombre: fields[2].trim(),
      primerApellido: fields[3].trim(),
      segundoApellido: fields[4].trim(),
      fechaNacimiento: new Date(fields[5]),
      departamento: fields[6],
    };
    return personaRetornar;
  }
  return null;
}

// ! Método que crea un JSON que contiene un array de objetos con los datos de las personas
function createJSON(text) {
  if (!text) return {};
  const records = text.split('\n');
  const jsonText = records
    .filter((record) => (record !== eliminado) & (record !== ''))
    .map((record) => {
      if (record === eliminado) {
      } else {
        const fields = record.split(';');
        const persona = {
          numeroIdentidad: fields[0].replace('\n', '').trim(),
          primerNombre: fields[1].trim(),
          segundoNombre: fields[2].trim(),
          primerApellido: fields[3].trim(),
          segundoApellido: fields[4].trim(),
          fechaNacimiento: new Date(fields[5]),
          departamento: fields[6],
        };
        return persona;
      }
    });
  return jsonText;
}

// ! Método que formatea un objeto persona en un registro para el archivo Personas.txt
function createRecord(persona) {
  if (!persona) return;
  const record = `${persona.numeroIdentidad.padEnd(
    13,
    ' '
  )};${persona.primerNombre.padEnd(10, ' ')};${persona.segundoNombre.padEnd(
    10,
    ' '
  )};${persona.primerApellido.padEnd(10, ' ')};${persona.segundoApellido.padEnd(
    10,
    ' '
  )};${new Date(persona.fechaNacimiento).toISOString()};${
    persona.departamento
  }\n`;
  return record;
}

// ! LISTA DE DISPONIBLES ! //

// ! Metodo que se encarga de registrar como no disponible una dirección en el archivo Disponibles.txt
function registrarNoDisponible(linea) {
  try {
    const listaDisponibles = getListaDisponibles();
    let newText = '';
    listaDisponibles.forEach((disponible) => {
      if (disponible.linea === String(linea)) {
        newText += `${disponible.linea};false\n`;
      } else {
        newText += `${disponible.linea};${disponible.disponible}\n`;
      }
    });
    fs.writeFileSync(rutaDisponibles, newText);
  } catch (error) {
    console.log(error);
  }
}

// ! Método que se encarga de registrar como disponible una dirección en el archivo Disponibles.txt
function registrarDisponible(linea) {
  try {
    const listaDisponibles = getListaDisponibles();
    let newText = '';
    listaDisponibles.forEach((disponible) => {
      if (disponible.linea === String(linea)) {
        newText += `${disponible.linea};true\n`;
      } else {
        newText += `${disponible.linea};${disponible.disponible}\n`;
      }
    });
    fs.writeFileSync(rutaDisponibles, newText);
  } catch (error) {
    console.log(error);
  }
}

// ! Método que retorna la lista de disponibles del archivo Disponibles.txt
// TODO: Eliminar este método porque está duplicado
function revisarDisponibles() {
  try {
    const text = fs.readFileSync(rutaDisponibles, 'utf8');
    const registros = text.split('\n');
    const disponibles = registros
      .map((registro) => {
        const fields = registro.split(';');
        const disponible = {
          linea: fields[0],
          disponible: fields[1],
        };
        return disponible;
      })
      .filter((disponible) => disponible.disponible === 'true');
    return disponibles;
  } catch (error) {
    console.log(error);
  }
}

// ! Método que retorna la lista de disponibles del archivo Disponibles.txt
function getListaDisponibles() {
  try {
    const text = fs.readFileSync(rutaDisponibles, 'utf8');
    const registros = text.split('\n');
    const disponibles = registros
      .filter((registro) => registro)
      .map((registro) => {
        const fields = registro.split(';');
        const disponible = {
          linea: fields[0],
          disponible: fields[1],
        };
        return disponible;
      });
    return disponibles;
  } catch (error) {
    console.log(error);
  }
}

// ! Método que se encarga de compactar el archivo Personas.txt y actualizar el archivo Disponibles.txt
function compactar() {
  try {
    const registrosMaximos = 100;
    let lineas = getLineas();
    let newText = '';

    lineas
      .filter((linea) => linea)
      .forEach((linea) => {
        if (linea !== eliminado) {
          newText += linea + '\n';
        }
      });
    fs.writeFileSync(ruta, newText);

    lineas = getLineas();

    let newTextDisponibles = '';
    for (let i = 0; i < registrosMaximos; i++) {
      if (lineas[i]) {
        newTextDisponibles += `${i + 1};false\n`;
      } else {
        newTextDisponibles += `${i + 1};true\n`;
      }
    }
    fs.writeFileSync(rutaDisponibles, newTextDisponibles);
    return { ok: true, message: 'Se ha compactado el archivo' };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: `No se pudo compactar el archivo, Error: ${error}`,
    };
  }
}

// ! Método que se encarga de retornar si podemos agregar una persona o no
function verificarSiPodemosEscribir() {
  const registrosMaximos = 100;
  const lineas = getLineas();
  const disponibles = revisarDisponibles();
  if (lineas.length >= registrosMaximos) {
    return {
      ok: false,
      message: 'No se puede escribir, el archivo está lleno',
    };
  }
  if (disponibles.length === 0) {
    return {
      ok: false,
      message: 'No se puede escribir, todos los registros están ocupados',
    };
  }
  return { ok: true, message: 'Se puede escribir' };
}

// ! PARTIDAS DE NACIMIENTO Y TARJETAS DE IDENTIDAD ! //

// ! Método que se encarga de obtener la partida de nacimiento de una persona según su número de identidad
function obtenerPartidaNacimiento(numeroIdentidad) {
  try {
    const lineasPartida = fs
      .readFileSync(rutaPartidasNacimiento, 'utf8')
      .split('\n')
      .filter((linea) => linea);

    const partidas = lineasPartida.map((linea) => {
      const fields = linea.split(';');
      const partida = {
        numeroIdentidad: fields[0],
        nombreCompletoPersona: fields[1],
        nombreCompletoPadre: fields[2],
        nombreCompletoMadre: fields[3],
        fechaNacimiento: new Date(fields[4]),
        departamento: fields[5],
      };
      return partida;
    });

    const partidaBuscada = partidas.find(
      (partida) => partida.numeroIdentidad === numeroIdentidad
    );

    if (!partidaBuscada) {
      return {
        ok: false,
        message: 'No se encontró la partida de nacimiento',
      };
    }

    return {
      ok: true,
      message: 'Se ha encontrado la partida',
      partida: partidaBuscada,
    };
  } catch (error) {
    return {
      ok: false,
      message: `No se pudo obtener la partida de nacimiento, Error: ${error}`,
    };
  }
}

// ! Método que crea una partida de nacimiento y la guarda en el archivo Nacimientos.txt
function crearPartidaNacimiento(identidades) {
  try {
    const padre = obtenerInformacionSegunId(identidades.numeroIdentidadPadre);
    const madre = obtenerInformacionSegunId(identidades.numeroIdentidadMadre);
    const persona = obtenerInformacionSegunId(identidades.numeroIdentidad);

    if (!padre || !madre || !persona) {
      return {
        ok: false,
        message: 'No se puede crear la partida de nacimiento',
      };
    }
    const record = createRecordNacimiento(persona, padre, madre);

    fs.appendFileSync(rutaPartidasNacimiento, record);

    return {
      ok: true,
      message: 'Se ha creado la partida de nacimiento',
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: `No se pudo crear la partida de nacimiento, Error: ${error}`,
    };
  }
}

// ! Método encargado de formatear los datos de 3 personas y convertirlos en un registro para el archivo Nacimientos.txt
function createRecordNacimiento(persona, padre, madre) {
  const nombreCompletoPersona = `${persona.primerNombre} ${persona.segundoNombre} ${persona.primerApellido} ${persona.segundoApellido}`;
  const nombreCompletoPadre = `${padre.primerNombre} ${padre.segundoNombre} ${padre.primerApellido} ${padre.segundoApellido}`;
  const nombreCompletoMadre = `${madre.primerNombre} ${madre.segundoNombre} ${madre.primerApellido} ${madre.segundoApellido}`;

  const record = `${persona.numeroIdentidad.padEnd(
    13,
    ' '
  )};${nombreCompletoPersona.padEnd(40, ' ')};${nombreCompletoPadre.padEnd(
    40,
    ' '
  )};${nombreCompletoMadre.padEnd(40, ' ')};${new Date(
    persona.fechaNacimiento
  ).toISOString()};${persona.departamento}\n`;

  return record;
}

// ! Método que se encarga de obtener la tarjeta de identidad de una persona según su número de identidad
function getTarjetaIdentidad(numeroIdentidad) {
  try {
    const lineasTarjeta = fs
      .readFileSync(rutaTarjetasIdentidades, 'utf8')
      .split('\n')
      .filter((linea) => linea);

    const tarjetas = lineasTarjeta.map((linea) => {
      const fields = linea.split(';');
      const tarjeta = {
        numeroIdentidad: fields[0],
        nombres: fields[1],
        apellidos: fields[2],
        fechaNacimiento: new Date(fields[3]),
        departamento: fields[4],
      };
      return tarjeta;
    });

    const tarjetaBuscada = tarjetas.find(
      (tarjeta) => tarjeta.numeroIdentidad === numeroIdentidad
    );

    if (!tarjetaBuscada) {
      return {
        ok: false,
        message: 'No se encontró la tarjeta de identidad',
      };
    }

    return {
      ok: true,
      message: 'Se ha encontrado la tarjeta',
      tarjeta: tarjetaBuscada,
    };
  } catch (error) {
    return {
      ok: false,
      message: `No se pudo obtener la tarjeta de identidad, Error: ${error}`,
    };
  }
}

// ! Método que crea una tarjeta de identidad y la guarda en el archivo Tarjetas.txt
function crearTarjetaIdentidad(numeroIdentidad) {
  try {
    const persona = obtenerInformacionSegunId(numeroIdentidad);

    if (!persona) {
      return {
        ok: false,
        message: 'No se puede crear la tarjeta de identidad',
      };
    }

    const record = createRecordTarjeta(persona);

    fs.appendFileSync(rutaTarjetasIdentidades, record);

    return {
      ok: true,
      message: 'Se ha creado la tarjeta de identidad',
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: `No se pudo crear la tarjeta de identidad, Error: ${error}`,
    };
  }
}

// ! Método encargado de formatear los datos de una persona y convertirlos en un registro para el archivo Identidades.txt
function createRecordTarjeta(persona) {
  const nombres = `${persona.primerNombre} ${persona.segundoNombre}`;
  const apellidos = `${persona.primerApellido} ${persona.segundoApellido}`;

  const record = `${persona.numeroIdentidad.padEnd(13, ' ')};${nombres.padEnd(
    20,
    ' '
  )};${apellidos.padEnd(20, ' ')};${new Date(
    persona.fechaNacimiento
  ).toISOString()};${persona.departamento}\n`;

  return record;
}

// ! Método que se encarga de obtener las lineas del archivo de personas
function getArchivoPuro() {
  try {
    const lineasArchivo = fs.readFileSync(ruta, 'utf8');
    if (!lineasArchivo) {
      return {
        ok: false,
        message: 'No se encontró el archivo',
      };
    }
    return {
      ok: true,
      message: 'Se ha encontrado el archivo',
      archivo: lineasArchivo,
    };
  } catch (error) {
    return {
      ok: false,
      message: `No se pudo obtener el archivo, Error: ${error}`,
    };
  }
}

// ! Método que se encarga de obtener las lineas del archivo de disponibles
function getArchivoDisponiblesPuro() {
  try {
    const lineasArchivo = fs.readFileSync(rutaDisponibles, 'utf8');
    if (!lineasArchivo) {
      return {
        ok: false,
        message: 'No se encontró el archivo',
      };
    }
    return {
      ok: true,
      message: 'Se ha encontrado el archivo',
      archivo: lineasArchivo,
    };
  } catch (error) {
    return {
      ok: false,
      message: `No se pudo obtener el archivo, Error: ${error}`,
    };
  }
}

// ! Exportamos los métodos
module.exports = {
  getPersonas,
  addPersona,
  deletePersona,
  revisarDisponibles,
  compactar,
  crearPartidaNacimiento,
  obtenerPartidaNacimiento,
  crearTarjetaIdentidad,
  getTarjetaIdentidad,
  getArchivoPuro,
  getArchivoDisponiblesPuro,
};
