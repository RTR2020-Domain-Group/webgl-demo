const SkyboxShader = {
    uniforms: {

    },

    vertexShaderObject: 0,
    fragmentShaderObject: 0,
    shaderProgramObject: 0,

    gVao: 0,
    gVboPositon: 0,
    gMVPMatrixUniform: 0,
    gPespectiveProjectionMatrix: 0,

    skybox_texture: 0,
    skybox_front_texture: 0,
    skybox_back_texture: 0,
    skybox_left_texture: 0,
    skybox_right_texture: 0,
    skybox_top_texture: 0,
    skybox_bottom_texture: 0,

    gct: 0,
    img: 0,

    init: function () {

        /**
         * Vertex Shader
         */
        this.vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);

        var sourceVertexShader =
            "#version 300 es\n" +
            "layout (location = 0) in vec3 vPosition;\n" +
            "uniform mat4 u_mvp_matrix;\n" +
            "out vec3 out_texCoords;\n" +
            "void main(void)\n" +
            "{\n" +
            "   out_texCoords = vPosition;\n" +
            "   gl_Position = u_mvp_matrix * vec4(vPosition, 1.0);\n" +
            "}\n";

        gl.shaderSource(this.vertexShaderObject, sourceVertexShader);
        gl.compileShader(this.vertexShaderObject);

        if (gl.getShaderParameter(this.vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.vertexShaderObject);
            if (error.length > 0) {
                alert("Skybox Vertex Shader log: " + error);
                return false;
            }
        }

        /**
         * Fragment Shader
         */

        this.fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);

        var sourceFragmentShader =
            "#version 300 es\n" +
            "precision highp float;\n" +
            "in vec3 out_texCoords;\n" +
            "out vec4 FragColor;\n" +
            "uniform samplerCube skybox;\n" +
            "void main(void)\n" +
            "{\n" +
            "     FragColor = texture(skybox, out_texCoords);\n" +
            "}\n";


        gl.shaderSource(this.fragmentShaderObject, sourceFragmentShader);
        gl.compileShader(this.fragmentShaderObject);

        if (!gl.getShaderParameter(this.fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.fragmentShaderObject);
            if (error.length > 0) {
                alert("Skybox Fragment Shader log: " + error);
                return false;
            }
        }

        /**
         * Shader Program
         */

        this.shaderProgramObject = gl.createProgram();

        gl.attachShader(this.shaderProgramObject, this.vertexShaderObject);
        gl.attachShader(this.shaderProgramObject, this.fragmentShaderObject);

        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");

        gl.linkProgram(this.shaderProgramObject);

        if (gl.getProgramParameter(this.shaderProgramObject, gl.LINK_STATUS) == false) {
            var error = gl.getProgramInfoLog(this.shaderProgramObject);

            if (error.length > 0) {
                alert("Skybox Program linking log: " + error);
                return false;
            }
        }

        this.gMVPMatrixUniform = gl.getUniformLocation(this.shaderProgramObject, "u_mvp_matrix");

        var skyboxVertices = new Float32Array([
            // positions          
            -1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            -1.0, 1.0, -1.0,

            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,

            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,

            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0
        ]);


        this.gVao = gl.createVertexArray();
        gl.bindVertexArray(this.gVao);

        this.gVboPositon = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gVboPositon);
        gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        //Texture code
        this.loadTextureCube();
        return true;
    },

    uninit: function () {
        gl.deleteProgram(this.shaderProgramObject);
    },

    use: function () {
        gl.useProgram(this.shaderProgramObject);
        return this.uniforms;
    },

    loadTextureCube: function () {
        this.gct = 0;
        this.img = new Array(6);
        //this.skybox_texture = gl.createTexture();
        var urls = [
            "res/textures/cubemap/right.png", "res/textures/cubemap/left.png",
            "res/textures/cubemap/top.png", "res/textures/cubemap/bottom.png",
            "res/textures/cubemap/front.png", "res/textures/cubemap/back.png"
        ];
        for (var i = 0; i < 6; i++) {
            this.img[i] = new Image();
            this.img[i].src = urls[i];
            this.img[i].onload = function () {
                if (!SkyboxShader.gct)
                    SkyboxShader.gct = 0;
                SkyboxShader.gct++;
            }
        }
    },

    generateSkybox: function () {
        this.skybox_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skybox_texture);
        var targets = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }
}

