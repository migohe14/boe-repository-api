API para el acceso a la colección de
Legislación Consolidada
Agencia Estatal Boletín Oficial del Estado
Madrid, 28 de junio de 202 4
1. Consideraciones generales
La API es una forma de intercambio de información entre sistemas indicada para la obtención de información
que se modifica frecuentemente.

Para el diseño de esta API se han tenido en cuenta los siguientes documentos:

Buenas prácticas en el diseño de APIS y Linked Data
Guía Práctica para la Publicación de Datos Abiertos usando APIS
OpenAPI Specification v3.1.
La API objeto de este documento es una API REST para obtención de información. Por ello, todas las
peticiones de información utilizarán el método "GET" sobre "https". La utilización de otro tipo de peticiones
("POST", "PUT", etc.) devolverá un error 403.

El formato de salida esperado se indicará utilizando la cabecera Accept en cada petición. Por ejemplo:

curl -X "GET" -H "Accept: application/xml" "https://boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-
A-1889- 4763 "

Los códigos de retorno son los habituales en las peticiones http/https:

Código Descripción
200 Operación correcta
400 – 499 Error en la petición del cliente. Ejemplos: 403 (Acceso no autorizado), 404 (La
información solicitada no existe)
500 – 599 Error del servidor al procesar la petición
En cuanto a la validación de parámetros, se contemplan estas posibles respuestas:

400 - El parámetro <<nombre_parámetro>> debe ser un número.
400 - El parámetro <<nombre_parámetro>> debe ser un entero.
400 - El parámetro <<nombre_parámetro>> de tipo <<tipo_valor_parámetro>> no ha sido especificado
siendo obligatorio.
400 - El parámetro <<nombre_parámetro>> de tipo query no ha sido especificado siendo obligatorio.
400 - No reconocido el formato de la cabecera Accept.

400 - No soportado ningún mime type de la cabecera Accept.

Otros errores dependientes del método implementado:

Para la búsqueda de normas (apartado 2.1)

400 - Search error: <<mensaje_error>>

Para obtener una norma concreta (apartado 2.2)

400 – Identificador no válido o parámetros incorrectos

404 - La información solicitada no existe

2. APIs
Se definen 2 formas de llamada en la API de acceso a la colección Legislación Consolidada:
API Función^ Respuesta^
/datosabiertos/api/legislacion-consolidada Obtención de la lista de normas^ Lista de normas.^
/datosabiertos/api/legislacion-consolidada/id/{id} Obtención de una norma
concreta
Norma completa
o parte de ella
2.1 API Lista de normas
Petición: /datosabiertos/api/legislacion-consolidada
Objeto del servicio: Ofrecer la lista de normas consolidadas con la fecha y hora de la última actualización de
cada una de ellas.
Respuesta: Devuelve la lista de normas ordenadas de forma descendente por su fecha y hora de última
actualización. Esta lista será parcial o completa en función de los parámetros especificados.
Parámetros:
Nombre Descripción Formato Defecto
from Fecha de inicio de la última
actualización de la norma

Fecha en formato ISO
8601
AAAAMMDD
Fecha de actualización
más antigua
to Fecha de fin de la última
actualización de la norma

Fecha en formato ISO
8601
AAAAMMDD
Fecha actual
query Cadena de búsqueda String en formato JSON Búsqueda vacía
offset Primer resultado a devolver Número entero positivo 0
limit Número máximo de resultados
Número entero positivo 50 (valor -1 para
obtener la lista
completa)

Todos los parámetros son opcionales. Si no se especifica ningún parámetro se devolverá una lista con los 50
primeros documentos por orden descendente de fecha de actualización.
Ejemplos:
Para descartar las 10 primeras normas y obtener en formato xml las 50 siguientes (porque aplicaría el
valor por defecto):
curl -L -X "GET" -H "Accept: application/xml" "https://boe.es/datosabiertos/api/legislacion-
consolidada?offset=10"
Para conseguir un listado en formato xml de todas las normas a partir de la 10:
curl -L -X "GET" -H "Accept: application/xml" "https://boe.es/datosabiertos/api/legislacion-
consolidada?offset=10&limit=-1"
Obtención de todas las normas en formato json:
curl -L -X "GET" -H "Accept: application/json" "https://boe.es/datosabiertos/api/legislacion-
consolidada?limit=-1"
Obtención de las normas modificadas en un intervalo de tiempo
curl -L -X "GET" -H "Accept: app lication/json" "https://boe.es/datosabiertos/api/legislacion-
consolidada?from=20220610&to=20220630&limit=-1"
Obtención de las normas modificadas desde una fecha hasta la actualidad
curl -L -X "GET" -H "Accept: app lication/json" "https://boe.es/datosabiertos/api/legislacion-
consolidada?from=20220610&limit=-1"
Cadena de búsqueda:

Se especifica en el parámetro query, en formato json con la siguiente estructura:

{

"query":{
"query_string": {"query":""},
"range":{ }
},
"sort":[]

}

Incluye estos tres elementos opcionales:

"query_string": Se incluye dentro de un elemento "query" de primer nivel, contiene a su vez un elemento
"query" en el que se especifica la condición de búsqueda, esta condición está compuesta por parejas de la
forma "campo:valor" unidas por conectores lógicos (and / or) y puede incluir agrupaciones indicadas con
paréntesis y negación (not).
Los campos permitidos en la cadena de búsqueda son los siguientes:
- ambito@codigo
- departamento@codigo
- rango@codigo
- fecha_disposicion
- numero_oficial
- titulo
- fecha_publicacion
- diario_numero
- vigencia_agotada
- estado_consolidacion@codigo
- materia@codigo
- texto
El campo texto se utiliza para hacer una búsqueda en todo el texto de la norma. El campo materia se
utiliza para buscar normas por temática, de acuerdo con un vocabulario controlado. El resto de campos se
incluyen en la respuesta y están especificados en la tabla al final de este apartado.
Ejemplo: "query_string":{"query":"titulo:crisis and (materia@codigo:6658 or materia@codigo:4107) "}
"range": Se incluye dentro de un elemento “query” de primer nivel, puede estar vacío o contener uno o
varios elementos de la forma:
"campo": { "gte": "valor-mínimo", "lte": "valor-máximo"}
Indica que deseamos filtrar valores para dicho campo que se encuentren entre "valor-mínimo" y "valor-
máximo". Se puede omitir uno de estos dos elementos.
Su uso se restringe solamente a campos de tipo fecha (Fecha_publicacion, Fecha_disposicion...) y los
valores se indicarán en formato ISO 8601.
Ejemplo: "range": {"fecha_publicacion": {"gte":"19990101", "lte":"19991231"}}
"sort": Elemento de primer nivel, es un array de objetos de la forma {“campo”:”tipo-ordenación”} dónde
"tipo-ordenación" es "asc" para ordenar ascendentemente (predeterminado) o “desc” para ordenar
descendentemente.
Se puede ordenar por cualquiera de los campos incluidos en la respuesta.
Ejemplo: "sort": [{"fecha_publicacion": "desc"}, {"departamento": "asc"}]
Formatos de salida ofrecidos: JSON, XML

Campos de salida: Los elementos mínimos a devolver en la respuesta serían el identificador de la norma y su
fecha y hora de actualización. Sin embargo, es conveniente incorporar una serie de campos adicionales a los
resultados de forma que se evite tener que consultar de nuevo cada norma de la lista de resultados para, por
ejemplo, mostrarlos en pantalla como respuesta a un formulario de búsqueda.

En la siguiente tabla se muestran los campos que se incluyen en la respuesta de la API.

Campos incluidos
en la respuesta de la API
Descripción Tipo Obl.
fecha_actualizacion Fecha de la última actualización en formato ISO
8601 (UTC): AAAAMMDDTHHmmSSZ
TIME [1..1]
identificador Identificador único del documento CHAR(20) [1..1]
ambito@codigo Indica si la norma es estatal o autonómica NUMBER [1..1]
ambito Descripción del ámbito CHAR(20) [1..1]
departamento@codigo Código BOE del Departamento NUMBER [1..1]
departamento Nombre del Departamento CHAR(100) [1..1]
rango@codigo Código BOE del Rango NUMBER [1..1]
rango Rango CHAR(100) [1..1]
fecha_disposicion Fecha de la disposición en formato AAAAMMDD DATE [0..1]
numero_oficial Número oficial CHAR(20) [0..1]
titulo Título CHAR(4000) [1..1]
diario Nombre oficial de la publicación CHAR(200) [1..1]
fecha_publicacion Fecha de publicación en formato AAAAMMDD DATE [1..1]
diario_numero Número de diario NUMBER [1..1]
fecha_vigencia Fecha de entrada en vigor en formato
AAAAMMDD
DATE [0..1]
vigencia_agotada Indica si la disposición ha agotado su vigencia CHAR(1) [1..1]
estado_consolidacion@codigo Código del estado de consolidación NUMBER [1..1]
estado_consolidacion Descripción del estado de consolidación CHAR(100) [1..1]
url_eli Permalink ELI CHAR(150) [0..1]
url_html_consolidada URL en https://www.boe.es CHAR(150) [1..1]
El tipo y formato de los valores devueltos se puede consultar en el apartado "2.2.1 Nodo ". Los
campos fecha_disposicion, numero_oficial, fecha_vigencia y url_eli son opcionales, solo se incluyen si existen
en la norma consolidada.

Formato XML: La estructura del contenido se basa en la especificación OpenAPI v3.1.0. Se adopta el término
"response" para el nodo raíz que contendrá dos nodos hijos:

"status": Indica el resultado de la operación. Incluye 2 elementos: "code" para indicar el código del
resultado de la operación y "text" con un breve mensaje del significado de la operación.
"data": Incluye la lista de normas resultado de la operación, cada una de ellas dentro de un elemento
"", en el que están los campos anteriormente mencionados.
Ejemplo de respuesta XML:

200 ok 20230303T120627Z BOE-A-2015-10566
Estatal
Jefatura del Estado
Ley
<fecha_disposicion>20151001</fecha_disposicion>
<numero_oficial>40/2015</numero_oficial>
Ley 40/2015, de 1 de octubre, de Régimen Jurídico del Sector Público.
Boletín Oficial del Estado
<fecha_publicacion>20151002</fecha_publicacion>
<diario_numero>236</diario_numero>
<fecha_vigencia>20161002</fecha_vigencia>
<vigencia_agotada>N</vigencia_agotada>
<estado_consolidacion codigo="3">Finalizado</estado_consolidacion>
<url_eli>https://www.boe.es/eli/es/l/2015/10/01/40</url_eli>
<url_html_consolidada>https://www.boe.es/buscar/act.php?id=BOE-A-2015-
10566</url_html_consolidada>

...

Formato JSON:

Se adopta una estructura similar al formato XML. Este formato prescinde de tener que nombrar el nodo raíz
("response") y las entradas de los documentos ("item").
{
"status": {
"code": "200",
"text": "ok"
},
"data": [
{
"fecha_actualizacion": "20221115T115748Z",
"identificador": "BOE-A-2015-10566",
"ambito": {
"codigo": "1",
"texto": "estatal"
},
"departamento": {
"codigo": "7723",
"texto": "Jefatura del Estado"
},
"rango": {
"codigo": "1300",
"texto": "Ley"
},
"fecha_disposicion": "20151001",
"numero_oficial": "40/2015",
"titulo": "Ley 40/2015, de 1 de octubre, de Régimen Jurídico del Sector
Público.",
"diario": "Boletín Oficial del Estado",
"fecha_publicacion": "20151002",
"diario_numero": "236",
"fecha_vigencia": "20161002",
"vigencia_agotada": "N",
"estado_consolidacion": {
"codigo": "3",
"texto": "Finalizado"
},
"url_eli": "https://www.boe.es/eli/es/l/2015/10/01/40",
"url_html_consolidada": "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566"
}
]
}

En caso de que la operación no devuelva resultados, por no encontrar documentos que cumplan las
condiciones de la búsqueda realizada, se devolverá un código 200 y el apartado "data" estará vacío. En
formato XML sería:

200 ok


Por su parte, la respuesta vacía en formato JSON sería:
{
"status": {
"code": "200",
"text": "ok"
},
"data": {}
}

2.2 API Obtención de una norma consolidada o parte de ella
El documento XML de una norma en su conjunto contiene 4 nodos no repetitivos que se incluyen en el nodo
"data" de la respuesta:

200 ok La información que contienen los nodos es la siguiente:
Nodo Descripción Obl.
metadatos Metadatos de la norma [1..1]
analisis Datos del análisis de las normas (referencias, materias, notas, etc.) [ 0 ..1]
metadata-eli Metadatos ELI (European Legislation Identifier) [0..1]
texto Texto consolidado de la norma con todas sus versiones [1..1]
En base a esos nodos se puede llamar a la API de distintas formas según se desee obtener la información
completa de cada norma o solamente parte de ella:

API Resultado Formato
de salida
/datosabiertos/api/legislacion-consolidada/id/{id} Norma completa XML
/datosabiertos/api/legislacion-consolidada/id/{id}/metadatos Metadatos de la
norma
XML, JSON
/datosabiertos/api/legislacion-consolidada/id/{id}/analisis Análisis de la
norma
XML, JSON
/datosabiertos/api/legislacion-consolidada/id/{id}/metadata-eli Metadatos ELI XML
/datosabiertos/api/legislacion-consolidada/id/{id}/texto Texto consolidado
completo con todas
las versiones de la
norma
XML
/datosabiertos/api/legislacion-consolidada/id/{id}/texto/indice Lista de los bloques
en que se divide el
texto de la norma
XML, JSON
/datosabiertos/api/legislacion-
consolidada/id/{id}/texto/bloque/{id_bloque}
Obtención de un
bloque de texto
consolidado
XML
El valor de {id} es el identificador único del documento y se corresponde con el valor
del campo "identificador" que se incluye en la respuesta de la lista de normas.

En caso de que el valor de {id} sea incorrecto se devolverá un error 400:

400 Identificador no válido o parámetros incorrectos
En caso de que no exista la información solicitada para la norma con identificador {id} o esta no esté
consolidada, se devolverá un error 404:

404 La información solicitada no existe
Por su parte, la obtención del texto permitirá profundizar en la estructura del texto consolidado y extraer
parte de él. Se ampliará la información en el apartado "Nodo "

2.2.1 Nodo
Los siguientes metadatos se incluyen dentro del nodo <metadatos>:
Elemento Descripción Tipo Formato Ejemplos: Obl.
fecha_actualizacion Fecha actualización en formato ISO 8601 (UTC):
AAAAMMDDTHHmmSSZ

TIME \d{14}Z 20200706 T 175601 Z [1..1]
identificador Identificador único del documento CHAR(20) [A-Z]{3}-[A-Z]-
\d{4}-\d{1,5}

BOE-A- 2022 - 1 [1..1]
ambito@codigo Indica si la norma es estatal o autonómica NUMBER \d{1} 1 [1..1]
ambito Descripción del ámbito CHAR(20) Estatal [1..1]
departamento@codigo Código BOE del Departamento NUMBER \d+ 1430 [1..1]
departamento Nombre del Departamento. CHAR(100) Jefatura de Estado [1..1]
rango@codigo Código BOE del Rango NUMBER \d+ 1240 [1..1]
rango Rango CHAR(100) Ley [1..1]
fecha_disposicion Fecha de la disposición en formato AAAAMMDD DATE \d{8} 20200603 [ 0 ..1]
numero_oficial Número oficial CHAR(20) 1/
PCM/997/

[ 0 ..1]
titulo Título CHAR(4000) Ley 1/2022 de... [1..1]
diario Nombre oficial de la publicación. CHAR(200) Boletín Oficial del Estado [1..1]
fecha_publicacion Fecha de publicación en formato AAAAMMDD DATE \d{8} 20210524 [1..1]
diario_numero Número de diario NUMBER \d+ 123 [1..1]
fecha_vigencia Fecha de entrada en vigor en formato AAAAMMDD DATE \d{0,8} 20200603 [0..1]
estatus_derogacion Indica si la disposición está derogada CHAR(1) [SN] S [1..1]
fecha_derogacion Fecha de derogación en formato AAAAMMDD DATE \d{0,8} 20200603 [0..1]
estatus_anulacion Indica si la disposición está anulada CHAR(1) [SN] S [1..1]
fecha_anulacion Fecha de anulación en formato AAAAMMDD DATE \d{0,8} 20200603 [0..1]
vigencia_agotada Indica si la disposición ha agotado su vigencia CHAR(1) [SN] N [1..1]
estado_consolidacion@codigo Código del estado de consolidación NUMBER [34] 4 [1..1]
estado_consolidacion Descripción del estado de consolidación CHAR(1 00 ) finalizado [1..1]
url_eli Permalink ELI CHAR(150) https://www.boe.es/eli/es/l/
2015/10/01/

[ 0 ..1]
url_html_consolidada URL en https://www.boe.es CHAR(150) https://www.boe.es/buscar/a
ct.php?id=BOE-A- 2000 - 323

[1..1]
Los campos fecha_disposicion, numero_oficial, fecha_vigencia, fecha_derogacion,
fecha_anulacion y url_eli son opcionales, solo se incluyen en la respuesta si existen para esa norma consolidada.

Ejemplo de contenido de metadatos:

<metadatos>
<fecha_actualizacion>20231009T122333Z</fecha_actualizacion>
<identificador>BOE-A-1992-26318</identificador>
< ambito codigo="1">Estatal</ambito>
<departamento codigo="7723">Jefatura del Estado</departamento>
<rango codigo="1300">Ley</rango>
<fecha_disposicion>19921126</fecha_disposicion>
<numero_oficial>30/1992</numero_oficial>
<titulo>Ley 30/1992, de 26 de noviembre, de Régimen Jurídico de las Administraciones
Públicas y del Procedimiento Administrativo Común.</titulo>
<diario>Boletín Oficial del Estado</diario>
<fecha_publicacion>19921127</fecha_publicacion>
<diario_numero>285</diario_numero>
<fecha_vigencia>19930227</fecha_vigencia>
<estatus_derogacion>S</estatus_derogacion>
<fecha_derogacion>20210402</fecha_derogacion>
<estatus_anulacion>N</estatus_anulacion>
<vigencia_agotada>S</vigencia_agotada>
<estado_consolidacion codigo="3">Finalizado</estado_consolidacion>
<url_eli>https://www.boe.es/eli/es/l/1992/11/26/30</url_eli>
<url_html_consolidada>https://www.boe.es/buscar/act.php?id=BOE-A-1992-
26318</url_html_consolidada>
</metadatos>
2.2.2 Nodo
El análisis de la norma incluye 3 nodos:






Nodo Descripción Obl
materias Materias sobre las que versa la norma [ 0 ..1]
notas Notas que aportan información adicional a la norma [ 0 ..1]
referencias Referencias entre normas (modificaciones, derogaciones, etc.) [ 0 ..1]
Estos tres nodos son opcionales, solo se incluyen en la respuesta si tienen contenido, a continuación se
desglosa cada uno de ellos.

2.2.2.1 Nodo
El nodo incluye las materias sobre las que versa la norma. Existe un vocabulario controlado
de materias con su identificador y su descripción.

El nodo se compone de elementos "" que incluyen el código de la materia y su texto
descriptivo:

Elemento Descripción Tipo Ejemplo
materia@codigo Código de la materia NUMBER 97
materia Texto descriptivo de la materia CHAR(256) Adopción
Ejemplo:


Adopción
...

2.2.2.2 Nodo
El nodo incluye notas de interés que aportan información adicional a la norma.

El nodo se compone de elementos "" que incluyen su texto descriptivo:

Elemento Descripción Tipo Ejemplo
nota Texto de la nota CHAR(1500) Publicada en núms. 206 a 208, de 25 a 27 de julio de 1889
Formato de salida: XML, JSON.

Ejemplo:


Publicada en núms. 206 a 208, de 25 a 27 de julio de 1889
...

2.2.2.3 Nodo
Este nodo incluye las relaciones de la norma considerada con otras normas. Las otras normas pueden
ser anteriores o posteriores en el tiempo a la norma por lo que el nodo puede contener
dos subnodos, uno para las referencias a normas anteriores (nodo "") y otro para las
posteriores (nodo "").





Nodo Descripción Obl
anteriores Referencias a normas anteriores [0..1]
posteriores Referencias a normas posteriores [ 0 ..1]
Tanto las referencias anteriores como posteriores utilizan un vocabulario controlado para indicar el tipo
de relación (deroga, modifica, etc.).

2.2.2.3.1 Nodo
El nodo incluye todas las referencias a normas publicadas con anterioridad con las que esta
norma está relacionada. Para cada referencia anterior se incluye un nodo de nombre "anterior". Los
elementos que contiene este nodo son:

Elemento Descripción Tipo Ejemplo
id_norma Identificador de la norma CHAR(20) BOE-A-^1989 -^14247
relacion@codigo Código que identifica la
relación
NUMBER 210
relacion Texto que define la relación CHAR(256) DEROGA
texto Texto que detalla la relación CHAR(1500) la Ley Orgánica 3/1989, de 21 de junio, excepto
disposiciones adicionales 1 y
2
Ejemplo de referencias anteriores de la norma BOE-A-1995-25444 (Ley Orgánica 10/1995, de 23 de
noviembre, del Código Penal):



<id_norma>BOE- A-1989-14247</id_norma>
DEROGA
la Ley Orgánica 3/1989, de 21 de junio, excepto disposiciones adicionales 1 y
2

...

En este ejemplo, el primer nodo indica que la norma BOE-A-1989-14247 ha sido derogada y
el texto de la referencia anterior sería "DEROGA la Ley Orgánica 3/1989, de 21 de junio, excepto
disposiciones adicionales 1 y 2".

2.2.2.3.2 Nodo
El nodo incluye todas las referencias a normas publicadas con posterioridad con las que la
norma está relacionada. Para cada referencia posterior se incluye un nodo de nombre "posterior". Los
elementos que contiene este nodo son:

Elemento Descripción Tipo Ejemplo
id_norma Identificador de la norma CHAR(20) BOE-A- 2015 - 3439
relacion@codigo Código que identifica la
relación

NUMBER 210
relacion Texto que define la relación CHAR(256) SE DEROGA
texto Texto que detalla la relación CHAR(1500) el libro III, SE AÑADE, SE SUPRIME, SE
MODIFICA determinados preceptos y
referencias indicadas, y SE DECLARA el
carácter de Ley ordinaria al art. 128, por Ley
Orgánica 1/2015, de 30 de marzo

Ejemplo de referencias posteriores de la norma BOE-A-2015-10565 (Ley 39/2015, de 1 de octubre, del
Procedimiento Administrativo Común de las Administraciones Públicas):
<posteriores>
<posterior>
<id_norma>BOE-A-2022-17040</id_norma>
<relacion codigo="407">SE AÑADE</relacion>
<texto>la disposición adicional 8, por Real Decreto-ley 18/2022, de 18 de
octubre</texto>
</posterior>
...
</posteriores>
En este ejemplo, el primer nodo <posterior> indica que la norma ha sido afectada por la norma posterior
BOE-A-2022-17040 y el texto de la modificación sería "SE AÑADE la disposición adicional 8, por Real
Decreto-ley 18/2022, de 18 de octubre ".
2.2.3 Nodo <metadata-eli>
Este nodo contiene los metadatos ELI (European Legislation Identifier) de la norma. Puede obtener la
información sobre el contenido de este nodo en:
https://boe.es/legislacion/eli.php
https://elidata.es
2.2.4 Nodo
El texto consolidado se estructura en unidades de información que se identifican dentro del documento
XML del texto por nodos de nombre <bloque>. Un bloque, a su vez contendrá al menos un elemento
versión.
<bloque ...>
<version ...>
<version ...>
...
</bloque>
Cada nodo <bloque> tiene los siguientes atributos:
Atributo Descripción Tipo Obl.
id Identificador único del bloque CHAR( 100 ) [1..1]
tipo Tipo de bloque CHAR(50) [1..1]
titulo Título del bloque CHAR(4000) [ 1 ..1]
fecha_caducidad Fecha de caducidad en formato AAAAMMDD a partir
de la cual el bloque deja de mostrarse.

DATE [0..1]
La lista de valores para el atributo "tipo" es:
nota_inicial
precepto
encabezado
firma
parte_dispositiva
parte_final
preambulo
instrumento
Tal y como se expresa en la tabla anterior, los atributos "id", "tipo" y "titulo" son obligatorios.
Por su parte, cada nodo <version> tiene los siguientes atributos:
Atributo Descripción Tipo Obl.

fecha_publicacion Fecha en formato AAAAMMDD de publicación de la
norma modificadora

DATE [1..1]
fecha_vigencia Fecha en formato AAAAMMDD de entrada en vigor de la
versión

DATE [ 0 ..1]
id_norma Identificador de la norma modificadora CHAR(20) [1..1]

Cada nodo <version> contiene el texto del bloque en formato HTML con los siguientes elementos:
Elemento Descripción Obl.

p Párrafo de texto [0..N]
table Tabla [0..N]
img Imagen codificada en base64. Todas las imágenes están en formato PNG. [0..N]
blockquote Nota informativa [0..N]

Siempre deberá existir al menos uno de los elementos descritos. No puede haber un nodo <version>
vacío.
Los párrafos "<p>" incluyen un atributo "class" que se utiliza para facilitar su presentación en un
navegador mediante CSS.
Las tablas siguen el estándar HTML.
Las imágenes se sirven en formato PNG incrustadas en el elemento <img> codificadas en base64.
Las notas (elemento "blockquote") contienen a su vez código HTML (párrafos, enlaces, etc...).
Ejemplo de nodo <texto>:
<texto>
<bloque id="no" tipo="nota_inicial">
<version id_norma="BOE-A-1996-4943" fecha_publicacion="19951124"
fecha_vigencia="19960524">
<p class="textoCompleto">Incluye la corrección de errores publicada en BOE núm.
54, de 2 de marzo de 1996. <a class="refPost">Ref. BOE-A-1996-4943</a></p>
</version>
</bloque>
...
<bloque id="a22" tipo="precepto" titulo="Artículo 22">
<version id_norma="BOE-A-1995-25444" fecha_publicacion="19951124"
fecha_vigencia="19960524">
<p class="articulo">Artículo 22.</p>
Son circunstancias agravantes:

1.ª Ejecutar el hecho con alevosía.

Hay alevosía cuando el culpable comete cualquiera de los delitos contra las personas empleando en la ejecución medios, modos o formas que tiendan directa o especialmente a asegurarla, sin el riesgo que para su persona pudiera proceder de la defensa por parte del ofendido.

... ... ...
Se modifica la circunstancia 4ª por el art. único.2 de la Ley Orgánica 5/2010, de 22 de junio. Ref. BOE-A-2010-9953

... ...
La petición del texto consolidado ofrece varias posibilidades:

API texto consolidado Resultado
/datosabiertos/api/legislacion-consolidada/id/{id}/texto Texto consolidado
completo
/datosabiertos/api/legislacion-consolidada/id/{id}/texto/indice Índice del texto
consolidado
/datosabiertos/api/legislacion-consolidada/id/{id}/texto/bloque/{id_bloque} Obtención de un
bloque del texto
consolidado
2.2.4.1 Obtención del texto consolidado completo
Formato de la llamada: /datosabiertos/api/legislacion-consolidada/id/{id}/texto

Parámetro de entrada {id}: identificador de la norma.

Formato de salida: XML

La respuesta devuelve el texto consolidado completo, con todas sus versiones.

Ejemplo de respuesta correcta:

200 ok ...
En caso de que el valor de {id} sea incorrecto se devolverá un error 400 y el nodo estará vacío:

400
Identificador no válido o parámetros incorrectos



En caso de no existir en la colección el {id} proporcionado en la llamada a la API se devolverá un código
de error 404:

404 La información solicitada no existe < data/>
2.2.4.2 Obtención del índice del texto documento
Formato de la llamada: /datosabiertos/api/legislacion-consolidada/id/{id}/indice

Parámetro de entrada {id}: identificador de la norma. Si se proporciona un {id} incorrecto se devolverá
un código de error 404 y el nodo de la respuesta estará vacío.

Formato de salida: XML, JSON

La respuesta incluye los elementos necesarios para poder mostrar un índice para la fecha de la versión
más reciente, también permite conocer el id de los bloques en que se estructura el texto.

Ejemplo de repuesta:

200 ok pr [preambulo] 20200718 https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020- 8099/texto/bloque/pr a1 Artículo 1 20220915 https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020- 8099/texto/bloque/a1 a2 Artículo 2 20220915 https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020- 8099/texto/bloque/a2 dd Disposición derogatoria 20200718 https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020- 8099/texto/bloque/dd df Disposición final única 20221115
https://www.boe.es/datosabiertos/api/legislacion-
consolidada/id/BOE-A-2020-8099/texto/bloque/df


fi
[firma]
<fecha_actualizacion>20200718</fecha_actualizacion>
https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020-
8099/texto/bloque/fi


an
ANEXO
<fecha_actualizacion>20220127</fecha_actualizacion>
https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2020-
8099/texto/bloque/an


2.2.4.3 Obtención de un bloque del texto consolidado
Formato de la llamada: /datosabiertos/api/legislacion-consolidada/id/{id}/texto/bloque/{id_bloque}

Parámetro de entrada {id}: identificador de la norma. Si se proporciona un {id} incorrecto se devolverá
un código de error 404 y el nodo de la respuesta estará vacío.

Parámetro de entrada {id_bloque}: identificador del bloque.

Formato de salida: XML

La respuesta devuelve un bloque del texto consolidado, con todas sus versiones.

Ejemplo de respuesta correcta:

200 ok ...
En caso de que el valor de {id} sea incorrecto se devolverá un error 400 y el nodo estará vacío:

400 Identificador no válido o parámetros incorrectos
En caso de no existir en la colección el {id} solicitado se devolverá un código de error 404 y el nodo
estará vacío:

404
La información solicitada no existe

< data/>
En caso de no existir en la norma el bloque identificado por {id_bloque} también se devolverá un código
de error 404 y el nodo estará vacío:

404 La información solicitada no existe < data/>