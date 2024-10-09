
#from fastapi import HTTPException
#from modules.writeTXT import *

import json 
import random 
import math
import time
import sys
import os


with open("/usr/share/nginx/html/PRIVADA/server/config/_config.json") as outfile:
    #print("Este es mi archivo ", outfile)
    rutas = json.load(outfile)
    espacioVacio = rutas["prod"]["espacioVacio"]
    espacioRelleno = rutas["prod"]["espacioRelleno"]
    

def formarTxt(pedido):
    
    #pedido_data = json.dumps(pedido)
    pedido_data = json.loads(pedido)
    
    
        
    clienteMs = pedido_data["clienteMs"] if "clienteMs" in pedido_data else None
    pedido = pedido_data["encabezado"]["folio"]
    cliente = pedido_data["encabezado"]["cliente"]
    tipodeCambio = pedido_data["encabezado"]["tipodecambio"]
    almacen = pedido_data["encabezado"]["almacen"]
    plazo = pedido_data["encabezado"]["plazo"]
    productos = pedido_data["productos"]
    fecha = math.floor(random.random() *  int(round(time.time() * 1000)))

    rutaIn = rutas["prod"]["rutas"]["CT"]["remision"]["in"]
    rutaOut = rutas["prod"]["rutas"]["CT"]["remision"]["out"]
    rutaError = rutas["prod"]["rutas"]["CT"]["remision"]["error"]
    filename = rutas["prod"]["rutas"]["CT"]["remision"]["prefijo"] + almacen + '_' + cliente + str(fecha) 

    grupos = {}
    for producto in productos:
        # AGRUPAMOS POR EL ID EMPRESA DEL PROVEEDOR DE CADA PRODUCTO O TODO EN IDCT
        
        # print("idCT ", process.vars.idCT)
        nombreGrupo = producto['empresa'] if producto['empresa'] else None
        
        if nombreGrupo is None:
            print("Error")
        else:
            if nombreGrupo and nombreGrupo not in grupos:
                grupos[nombreGrupo] = []
            if nombreGrupo:
                grupos[nombreGrupo].append({
                    'clave': producto['clave'],
                    'cantidad': producto['cantidad'],
                    'costo': producto['precioFinal'],
                    'moneda': producto['moneda']
                })

    

    ordenes = []
    ordenTXT = ''
    _EmptySpace = "                                                            "
    _RellenoNombre = "_RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR"
    for nombreGrupo in grupos:
        # Cabecera del archivo para la Remision u Orden de Compra
    

        facturaProveedor = pedido_data["facturaProveedor"] if "facturaProveedor" in pedido_data else None
    


    if facturaProveedor is not None:
        ordenTXT = _EmptySpace[:21] + (nombreGrupo + _EmptySpace)[:15] + " " + (almacen + _EmptySpace)[:3] + " " + plazo + "  4            " + pedido_data['remision'] + "@\r\n"
    else:
        
        
        ordenTXT = _EmptySpace[:21] + (nombreGrupo + _EmptySpace)[:15] + " " + (almacen + _EmptySpace)[:3] + " " + str(plazo) + "  2                    @\r\n"
    #print("Este es mi ordenTxt ", ordenTXT)
    for art in grupos[nombreGrupo]:
    
        tc = tipodeCambio if art['moneda'] == "MXN" else " 1.00"
    
        
        
        ordenTXT += (str(art["cantidad"]) + _EmptySpace[:10]  + " " +
        str(art['clave']) + _EmptySpace[:5] + "  " +str(art['costo']) + _EmptySpace[:8] + "16.00  0.00  " + (str(tc) + _EmptySpace)[:5] + "@\r\n")
        
        
    # Rellenamos el nombre para conservar una longitud estandar en el nombre de l archivo
    filenameComp = (filename + '_' + nombreGrupo +'_'+pedido+  _RellenoNombre)[:49]

    ordenes.append({
        'folioPedido': pedido,
        'rutaIn': rutaIn,
        'rutaOut': rutaOut,
        'rutaError': rutaError,
        'filename': filenameComp,
        'txt': ordenTXT
    })


    print(ordenes)

    return ordenes


#print(formarTxt(sys.argv[1]))


def crearArchivos(data):    
      
  archivos_write = []
  documentos = data
  
  for archivo in documentos:
              ruta_in = archivo['rutaIn']
              filename = archivo['filename']
              txt = archivo['txt']
              print("Esta es mi ruta in ", ruta_in)
              print("Este es mi filename ", filename)
              print("Este es mi txt ", txt)
              
              ruta_archivo = ruta_in + filename + ".txt"
              
              with open(ruta_archivo, "a") as f:
                print("Este es mi f ", f)
                f.writelines(txt)
                f.close()
                if f.closed:
                    print("Entre al if ")
                else:
                    print("Error else")
                                
  archivos_write.append(archivo)
  print("Este es mi archivos write ", archivos_write)
  return archivos_write
#remisionestxt = [{'folioPedido': 'W01-33333', 'rutaIn': '/datos/webpage/Compras/in/', 'rutaOut': '/datos/webpage/Compras/out/', 'rutaError': '/datos/api_privada_produccion/server/archivos/remision/', 'filename': 'Comp01A_HMO3061998970948689_MSF001_W01-226539_RRR', 'txt': '                     MSF001          01A 00  2                    @\r\n3           ESDMSF100                 2734.67               16.00  0.00  18.91@\r\n'}]






import os
import xml.etree.ElementTree as ET
import time
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor


def read_file(filename: str, rutaIn: str) -> Dict:
    with open(os.path.join(rutaIn, filename), "r") as f:
        content = f.read()
        result = ET.parse(content)
        print("Este es mi xml ", result)
        return result


def process_file(objeto: Dict) -> Dict:
    rutaIn = objeto['rutaIn']
    rutaOut = objeto['rutaOut']
    rutaError = objeto['rutaError']
    filename = objeto['filename']
    folioPedido = objeto['folioPedido']
    encontrado = False
    contador = 0
    ruta_archivo = rutaIn + filename + '.xml'
    print("Este es mi filename", filename + '.xml')
    print("Esta es mi ruta in ", rutaIn)
    while not encontrado and contador < 150:
        try:
            with open(ruta_archivo) as outfile:
                remision = outfile.read()
                remisionFinal = ET.parse(remision)
                print("Este es mi archivo remision", remisionFinal)
                print('=============== #0 Archivo encontrado: ' + filename + '.xml')
                encontrado = True
        except Exception as e:
            contador += 1
            print(f'INTENTO {contador}')
            if contador == 150:
                mensaje = ''
                if filename.startswith('Fact'):
                    mensaje = f'NO SE PUDO PROCESAR LA FACTURA ARCHIVO: {filename}.xml'
                elif filename.startswith('Comp'):
                    mensaje = f'NO SE PUDO PROCESAR LA PROCESAR REMISION ARCHIVO: {filename}.xml'
                elif filename.startswith('PedW'):
                    mensaje = f'NO SE PUDO PROCESAR EL PEDIDO ARCHIVO: {filename}.xml'
                elif filename.startswith('Alta'):
                    mensaje = f'NO SE PUDO PROCESAR LA FACTURA PROVEEDOR ARCHIVO: {filename}.xml'
                return {
                    'folioPedido': folioPedido,
                    'error': True,
                    'errorMensaje': mensaje,
                    'rutaIn': rutaIn,
                    'rutaOut': rutaError,
                    'filename': filename + '.txt'
                }
            time.sleep(0.2)

    return {
        'folioPedido': folioPedido,
        'rutaIn': rutaIn,
        'rutaOut': rutaOut,
        'file': remisionFinal,
        'filename': filename + '.xml'
    }


def process_documents(documentos: List[Dict]) -> List[Dict]:
    encontrados = []
    with ThreadPoolExecutor() as executor:
        for objeto in documentos:
            encontrados.append(executor.submit(process_file, objeto))

    return [e.result() for e in encontrados]


# Example usage:
#documentos = [{ 'folioPedido': 'W01-226539', 'rutaIn': '/datos/webpage/Compras/in/', 'rutaOut': '/datos/webpage/Compras/out/', 'rutaError': '/datos/api_privada_produccion/server/archivos/remision/', 'filename': 'Comp01A_HMO3061527156108361_MSF001_W01-226539_RRR', 'txt': '                     MSF001          01A 00  2                    @\r\n3           ESDMSF100       2734.67        16.00  0.00  18.91@\r\n' }]
#txt = formarTxt(sys.argv[1])
#archivos = crearArchivos(txt)
documentos = [{'folioPedido': 'W01-33333', 'rutaIn': '/datos/webpage/Compras/in/', 'rutaOut': '/datos/webpage/Compras/out/', 'rutaError': '/datos/api_privada_produccion/server/archivos/remision/', 'filename': 'Comp01A_HMO3061904406154319_MSF001_W01-33333_RRRR', 'txt': '                     MSF001          01A 00  2                    @\r\n3           ESDMSF100       2734.67        16.00  0.00  18.91@\r\n'}]
result = process_documents(documentos)
print(result)
sys.stdout.flush()



       
        #return  writeFile(texto, "prueba" ,".txt", "/usr/share/nginx/html/pastrano-py/privada-py/Archivos/")
        #return {"Method": "Post", "Pedido": pedido}
    #except EmailNotValidError as e:
        # Email is not valid.
        # The exception message is human-readable.
        #print(str(e))
        #raise HTTPException(status_code=400, detail=str(e))
        #return {"Method": "Post", "Pedido": pedido, "error": str(e)}
        

