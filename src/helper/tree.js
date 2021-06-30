function Tree(n, m, gl) {
    var vertices = [], indices = [], normals = [], q = Math.random();
    var flag = 0;
    function _tree(n, m) {
        if (n === 0) return;

        // draw the current level branch geometry
        // branch width decreases, branch height is slightly randomized
        var w = 0.01 * n + 0.02, h = 0.2 + Math.random() * 0.2;

        _box(m, h, w, vertices, indices, normals, n, q);

        // recurse two smaller branches split at a random direction
        var size = 0.78, th = 0.48;
        var _x = Math.random(), _y = Math.random(), _z = Math.random();
        var _r = 1 / Math.sqrt(_x * _x + _y * _y + _z * _z);
        _x *= _r; _y *= _r; _z *= _r;


        _tree(n - 1, ROT(th, _x, _y, _z)
            .compose(SIZE(size, size, size))
            .compose(MOV(0, h * 0.9, 0))
            .compose(m), vertices, indices);
        _tree(n - 1, ROT(-th, _x, _y, _z)
            .compose(SIZE(size, size, size))
            .compose(MOV(0, h * 0.9, 0))
            .compose(m), vertices, indices);
    }
    _tree(n || 10, m || new Matrix4());

    return new Mesh(vertices, indices, normals, gl);
}

var norm = [
    [-0.70, 0, -0.70],
    [-0.70, 0, -0.70],
    [-0.70, 0, -0.70],
    [-0.70, 0, -0.70],
    [0.70, 0, 0.70],
    [0.70, 0, 0.70],
    [0.70, 0, 0.70],
    [0.70, 0, 0.70],
];

var texArr = [
    [1.0, 0.0],
    [0.0, 0.0],
    [1.0, 1.0],
    [0.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],

]

function _box(m, h, w, v, I, N, n, q) {
    if (n == 1) {
        h = w = 0.3;
    }
    var o = m.transform([0, 0, 0, 1]);
    var dy = m.transform([0, h, 0, 0]);
    var dx = m.transform([w / 2, 0, 0, 0]);
    var dz = m.transform([0, 0, w / 2, 0]);

    var V = v.length / 10, d = 0.8;

    var idx = 0;
    for (var i = 0; i < 2; i++)
        for (var j = 0; j < 2; j++)
            for (var k = 0; k < 2; k++) {
                _i = (1 - 0.2 * j) * i;
                _k = (1 - 0.2 * j) * k;
                if (i == 0) {
                    v.push(
                        o[0] + _i * dx[0] + j * dy[0] + _k * dz[0],
                        o[1] + _i * dx[1] + j * dy[1] + _k * dz[1],
                        o[2] + _i * dx[2] + j * dy[2] + _k * dz[2],
                        n, q,
                        norm[idx][0], norm[idx][1], norm[idx][2],
                        texArr[idx][0], texArr[idx][1]);
                } else {
                    v.push(
                        o[0] + _i * dx[0] + j * dy[0] + _k * dz[0],
                        o[1] + _i * dx[1] + j * dy[1] + _k * dz[1],
                        o[2] + _i * dx[2] + j * dy[2] + _k * dz[2],
                        n, q,
                        norm[idx][0], norm[idx][1], norm[idx][2],
                        texArr[idx][0], texArr[idx][1]);
                }
                idx++;
            }

    I.push(
        V, V + 1, V + 2, V + 2, V + 1, V + 3,
        V, V + 1, V + 4, V + 4, V + 1, V + 5,
        V, V + 2, V + 4, V + 4, V + 2, V + 6,
        V + 7, V + 6, V + 5, V + 5, V + 6, V + 4,
        V + 7, V + 6, V + 3, V + 3, V + 6, V + 2,
        V + 7, V + 5, V + 3, V + 3, V + 5, V + 1
    );
}

function Mesh(vertices, indices, normals, gl) {

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vertbuffer = gl.createBuffer();
    this.vertexcount = vertices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_COLOR, 2, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_COLOR);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 40, 20);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, 2, gl.FLOAT, false, 40, 32);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.indexbuffer = gl.createBuffer();
    this.indexcount = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexbuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}

function drawTree(tree) {
    gl.bindVertexArray(tree.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree.vertbuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tree.indexbuffer);

    gl.drawElements(gl.TRIANGLES, tree.indexcount, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
}

function Matrix4(data) {
    this.data = data || [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
}

Matrix4.prototype.compose = function (o) {
    var data = [0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0];

    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++) {
            for (var n = 0; n < 4; n++) {
                data[i * 4 + j] += this.data[i * 4 + n] * o.data[n * 4 + j];
            }
        }
    return new Matrix4(data);
};

Matrix4.prototype.transform = function (v) {
    var m = this.data;

    return [
        v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + v[3] * m[12],
        v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + v[3] * m[13],
        v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + v[3] * m[14],
        v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + v[3] * m[15]
    ];
};

Matrix4.translate = (x, y, z) => new Matrix4([1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1]);

Matrix4.scale = (x, y, z) => new Matrix4([x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1]);

Matrix4.rotateAxis = (th, x, y, z) => {
    var s = Math.sin(th), c = Math.cos(th), t = 1 - c;
    return new Matrix4([
        1 + t * x * x - t, -z * s + t * x * y, y * s + t * x * z, 0,
        z * s + t * x * y, 1 + t * y * y - t, -x * s + t * y * z, 0,
        -y * s + t * x * z, x * s + t * y * z, 1 + t * z * z - t, 0,
        0, 0, 0, 1])
};

var MOV = Matrix4.translate, SIZE = Matrix4.scale, ROT = Matrix4.rotateAxis;

