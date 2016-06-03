// hacemos referencia a la dependencia 
var mongodb = require('mongodb');

// obtenemos el server MongoDB que dejamos corriendo
// *** el puerto 27017 es el default de MongoDB
var server = new mongodb.Server("127.0.0.1", 27017, {});

// obtenemos la base de datos de prueba que creamos
var dbTest = new mongodb.Db('unTestDB', server, {})

// abrimos la base pasando el callback para cuando esté lista para usar
dbTest.open(function (error, client) {
  if (error) throw error;

  //en el parámetro client recibimos el cliente para comenzar a hacer llamadas
  //este parámetro sería lo mismo que hicimos por consola al llamar a mongo
  
  //Obtenemos la coleccion personas que creamos antes
  var collection = new mongodb.Collection(client, 'personas');
  
  //disparamos un query buscando la persona que habiamos insertado por consola
  collection.find({'nombre': 'pepe'}).toArray(function(err, docs) {

    //imprimimos en la consola el resultado
    console.dir(docs);
  });
});