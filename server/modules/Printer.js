/**
 * Módulo encargado de imprimir las líneas de código de error
 * se utilizará como modelo para imprimir las claves de operación
 * 
 */

/**
 * Objeto Modelo
 * Definición de Variable para responder las peticiones
 * @param Printer
 * ejemplo de rellenado,
 * let PrintError = {
 *            "Log" : ">>>Clave de Operación: 002",
 *            "File": "/modules/paqueteria.js",
 *            "Line": "88 - 128",
 *        "Status"  : "Error",
 *        "Message" : "Error al Consultar con Mongo",
 *   "ResponseCode" : "500.0",
 *   "ResponseText" : "Se presentó un error en la consulta !!!"
 *
 *            }
 */
let Print
let Log;
let File;
let Line;
let Status;
let Message;
let ResponseCode;
let ResponseText;
function Printer (_Log = null, _File = null, _Line = null, _Status = null, _Message = null, _ResponseCode = null, _ResponseText = null) {
    Print = {
        
        "Log"          : _Log,
        "File"         : _File,
        "Line"         : _Line,
        "Status"       : _Status,
        "Message"      : _Message,
        "ResponseCode" : _ResponseCode,
        "ResponseText" : _ResponseText
        
    }
    Log          = _Log   
    File         = _File
    Line         = _Status
    Message      = _Message
    ResponseCode = _ResponseCode;
    ResponseText = _ResponseText;
    console.log(JSON.stringify(Print))
    return Print
}


function Imprimir() {
    console.log(JSON.stringify(Print))
    return Print
}

function _Log () {

    return Log
  
}

function _setLog(set = null){
    Log = set ? set : Log
    return Log
}

function _File () {
    
    return File

}

function _setFile(set = null){
    File = set ? set : Log
    return File
}

function _Line () {

    return Line
    
}

function _setLine(set = null){
    Line = set ? set : Log
    return Line
}

function _Status () {
    
    return Status
    
}

function _setStatus(set = null){
    Status = set ? set : Log
    return Status
}

function _Message () {
    
    return Message 
    
}

function _setMessage(set = null){
    Message = set ? set : Log
    return Message
}

function _ResponseCode () {
    
    return ResponseCode
}

function _setResponseCode(set = null){
    ResponseCode = set ? set : Log
    return ResponseCode
}

function _ResponseText () {
    
    return ResponseText

}

function _setResponseText(set = null){
    ResponseText = set ? set : Log
    return ResponseText
}

module.exports = {
    Printer, 
    Imprimir, 
    _Log, 
    _File, 
    _Line, 
    _Status, 
    _Message, 
    _ResponseCode, 
    _ResponseText, 
    _setLog, 
    _setFile, 
    _setLine,
    _setStatus,
    _setMessage,
    _setResponseCode,
    _setResponseText
};