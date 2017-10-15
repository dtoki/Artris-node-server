/**
 * Created by Dolapo Toki
 * 
 * This module creates each block and deals with methods for moving, rotating and renderign the shapes.
 */

var Tetris = require('./tetris.js');
var THREE = require('three');

Tetris.Utils = {};

Tetris.Utils.cloneVector = function (v) {
    return {x:v.x, y:v.y, z:v.z};
};

Tetris.Utils.roundVector = function(v) {
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    v.z = Math.round(v.z);
};

Tetris.Block = {};

Tetris.Block.shapes = [
    [
        {x:0, y:0, z:0},
        {x:1, y:0, z:0},
        {x:1, y:1, z:0},
        {x:1, y:2, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:0, y:2, z:0},
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:1, y:0, z:0},
        {x:1, y:1, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:0, y:2, z:0},
        {x:1, y:1, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0}, 
        {x:1, y:1, z:0},
        {x:1, y:2, z:0}
    ]
];

Tetris.Block.position = {};

Tetris.Block.generate = function () {
    var geometry, tmpMesh, i;
    var type = Math.floor(Math.random() * (Tetris.Block.shapes.length));
    this.blockType = type;

    Tetris.Block.shape = [];
    for (i = 0; i < Tetris.Block.shapes[type].length; i++) {
        Tetris.Block.shape[i] = Tetris.Utils.cloneVector(Tetris.Block.shapes[type][i]);
    }

    geometry = new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
    for (i = 1; i < Tetris.Block.shape.length; i++) {
        tmpMesh = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
        tmpMesh.position.x = Tetris.blockSize * Tetris.Block.shape[i].x;
        tmpMesh.position.y = Tetris.blockSize * Tetris.Block.shape[i].y;
        geometry.mergeMesh(tmpMesh);
    }

    Tetris.Block.mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshBasicMaterial({color:0x000000, flatShading:THREE.FlatShading, wireframe:true, transparent:true}),
        new THREE.MeshBasicMaterial({color:0xff0000})
    ]);

    // initial position
    Tetris.Block.position = {x:Math.floor(Tetris.boundingBoxConfig.splitX / 2) - 1, y:Math.floor(Tetris.boundingBoxConfig.splitY / 2) - 1, z:15};

    if (Tetris.Board.testCollision(true) === Tetris.Board.COLLISION.GROUND) {
        Tetris.gameOver = true;
        // NOTE: removed because not needed for game
        // Tetris.pointsDOM.innerHTML = "GAME OVER";
        // Tetris.sounds["gameover"].play();
        // Cufon.replace('#points');
    }

    Tetris.Block.mesh.position.x = (Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize / 2;
    Tetris.Block.mesh.position.y = (Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize / 2;
    Tetris.Block.mesh.position.z = (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    Tetris.Block.mesh.rotation = {x:0, y:0, z:0};
    Tetris.Block.mesh.overdraw = true;

    // This add's the object to the scence 
    Tetris.scene.add(Tetris.Block.mesh);
};

// rotate the block in any of the following axis.
Tetris.Block.rotate = function (x, y, z) {
    Tetris.Block.mesh.rotation.x += x * Math.PI / 180;
    Tetris.Block.mesh.rotation.y += y * Math.PI / 180;
    Tetris.Block.mesh.rotation.z += z * Math.PI / 180;

    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.setRotationFromEuler(Tetris.Block.mesh.rotation);

    for (var i = 0; i < Tetris.Block.shape.length; i++) {
        Tetris.Block.shape[i] = rotationMatrix.multiplyVector3(
            Tetris.Utils.cloneVector(Tetris.Block.shapes[this.blockType][i])
        );
        Tetris.Utils.roundVector(Tetris.Block.shape[i]);
    }

    if (Tetris.Board.testCollision(false) === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.rotate(-x, -y, -z); // laziness FTW
    }
};

Tetris.Block.move = function (x, y, z, callback) {
    // console.log("move");
    Tetris.Block.mesh.position.x += x * Tetris.blockSize;
    Tetris.Block.position.x += x;

    Tetris.Block.mesh.position.y += y * Tetris.blockSize;
    Tetris.Block.position.y += y;

    Tetris.Block.mesh.position.z += z * Tetris.blockSize;
    Tetris.Block.position.z += z;

    var collision = Tetris.Board.testCollision((z != 0));

    if (collision === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.move(-x, -y, 0); // laziness FTW
    }
    // if the collision is wit the ground 
    if (collision === Tetris.Board.COLLISION.GROUND) {
        Tetris.Block.hitBottom();
		Tetris.Board.checkCompleted();		
    } else {
		
    }
    
    // Prepare data to send 
    var dataToSendToFirebase = {};
    dataToSendToFirebase[Tetris.Block.mesh.uuid] = {
        shape: Tetris.Block.shape,
        position: Tetris.Block.position,
        blockType: Tetris.Block.blockType,

    };
    callback(dataToSendToFirebase);
};

/**
 * call when hits the floor and should be transformed to static blocks
 */
Tetris.Block.petrify = function () {
    var shape = Tetris.Block.shape;
    for (var i = 0; i < shape.length; i++) {
        Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y, Tetris.Block.position.z + shape[i].z);
        Tetris.Board.fields[Tetris.Block.position.x + shape[i].x][Tetris.Block.position.y + shape[i].y][Tetris.Block.position.z + shape[i].z] = Tetris.Board.FIELD.PETRIFIED;
    }
};

Tetris.Block.hitBottom = function () {
    Tetris.Block.petrify();
    // FIXME: find out way to remove the mesh from the scene so it's less processing intensive on a render
    // Tetris.scene.removeObject(Tetris.Block.mesh);
    Tetris.Block.generate();
};

module.exports = Tetris.Block;
