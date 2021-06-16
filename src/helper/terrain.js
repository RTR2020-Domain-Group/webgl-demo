function generateTerrain(width, height) {
    var i, j;
    var vao;
    var vbo;
    var vboIndex;

    var vertex = [];
    for (j = 0; j < height; j++) {
        var fj = j / height;
        for (i = 0; i < width; i++) {
            var fi = i / width;

            vertex.push((fi - 0.5) * width, 0.0, (fj - 0.5) * height,
                0.0, 1.0, 0.0,
                fi, fj);
        }
    }
    vertex = new Float32Array(vertex);
    console.log(vertex.length);

    var index = [];
    for (j = 0; j < height - 1; j++) {
        for (i = 0; i < width; i++) {
            index.push(j * width + i);
            index.push((1 + j) * width + i);
        }
        index.push((1 + j) * width + (i - 1));
        index.push((2 + j) * width);
    }
    console.log(index.length);
    index = new Uint32Array(index);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        8 * 4, 0 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        8 * 4, 3 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0,
        2, // 2 for s,t axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        8 * 4, 6 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vboIndex = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vboIndex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    return {
        vao: vao,
        vbo: vbo,
        vboIndex: vboIndex,
        numElements: index.length,

        draw: function () {
            gl.bindVertexArray(this.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboIndex);
            gl.drawElements(gl.TRIANGLE_STRIP, this.numElements, gl.UNSIGNED_INT, 0);
            gl.bindVertexArray(null);
        },

        uninit: function () {
        },
    };
}
