var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


var app = express();
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    
    //Tipos  de coleccion
    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no válida',
            errors: {message: 'Tipo de coleccion no válida'}
        });
     }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    // Obtener nombre  del archivo.
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Solo estas extensiones aceptamos
     var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

     if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: {message: 'Las extensiones validad son '+ extensionesValidas.join(', ')}
        });
     }

     // Nombre de archivo personalizado
     var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

     // Mover el archivo del temporal a un path
     var path = `./uploads/${tipo}/${nombreArchivo}`;

     subirPorTipo(tipo, id, nombreArchivo, path, archivo, res);
});

function subirPorTipo(tipo, id, nombreArchivo, path, archivo, res){
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario ) => {

            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                }); 
            }

              var pathViejo = './uploads/usuarios/' + usuario.img;

              //Si existe, elimina la imagen anterior
             if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
             }

              usuario.img = nombreArchivo;
              usuario.save((err, usuarioActualizado ) => {
                usuarioActualizado.password = ':)';
                subirCarpeta(path, archivo);
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });    
             });
             
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico ) => {

            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                }); 
            }

            var pathViejo = './uploads/medicos/' + medico.img;
  
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
  
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado ) => {
                subirCarpeta(path, archivo);
              return res.status(200).json({
                      ok: true,
                      mensaje: 'Imagen de medico actualizada',
                      medico: medicoActualizado
                  });    
            });
          });     
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital ) => {

            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'hospital no existe',
                    errors: {message: 'hospital no existe'}
                }); 
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
  
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
  
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado ) => {
              subirCarpeta(path, archivo);
              return res.status(200).json({
                      ok: true,
                      mensaje: 'Imagen del hospital actualizada',
                      hospital: hospitalActualizado
                  });    
            });
          });   
    }
}

function subirCarpeta(path, archivo){
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

     });

}

module.exports = app;