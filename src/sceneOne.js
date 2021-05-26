var sceneOne = {

    vertexShaderObject: 0,
    fragmentShaderObject: 0,
    shaderProgramObject: 0,

    vaoCube: 0,
    vboCube: 0,
    vboElement: 0,

    mUniform: 0,
    vUniform: 0,
    pUniform: 0,

    texDiff: 0,
    texAnim: 0,
    samplerUniform: 0,

    laUniform: 0,
    kaUniform: 0,
    ldUniform: 0,
    kdUniform: 0,
    lsUniform: 0,
    ksUniform: 0,
    shininessUniform: 0,

    enableLightUniform: 0,
    lightPositionUniform: 0,

    lightAmbient: new Float32Array([0.5, 0.5, 0.5]),
    lightDiffuse: new Float32Array([1.0, 1.0, 1.0]),
    lightSpecular: new Float32Array([1.0, 1.0, 1.0]),
    lightPosition: new Float32Array([10.0, 10.0, 10.0, 1.0]),

    materialAmbient: new Float32Array([0.5, 0.5, 0.5]),
    materialDiffuse: new Float32Array([1.0, 1.0, 1.0]),
    materialSpecular: new Float32Array([1.0, 1.0, 1.0]),
    materialShininess: 128.0,

    perspectiveProjectionMatrix: mat4.create(),

    bLight: false,
    angleCube: 0,
    numElements: 0,

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es" +
            "\n" +
            "precision highp int;" +
            "in vec4 vPosition;" +
            "in vec4 vColor;" +
            "in vec3 vNormal;" +
            "in vec2 vTexcoord;" +
            "uniform mat4 u_m_matrix;" +
            "uniform mat4 u_v_matrix;" +
            "uniform mat4 u_p_matrix;" +
            "uniform vec4 u_light_position;" +
            "uniform int u_enable_light;" +
            "out vec3 tnorm;" +
            "out vec3 light_direction;" +
            "out vec3 viewer_vector;" +
            "out vec2 out_Texcoord;" +
            "out vec4 out_Color;" +
            "void main (void)" +
            "{" +
            "   if (u_enable_light == 1) " +
            "   { " +
            "       vec4 eye_coordinates = u_v_matrix * u_m_matrix * vPosition;" +
            "       tnorm = mat3(u_v_matrix * u_m_matrix) * vNormal;" +
            "       light_direction = vec3(u_light_position - eye_coordinates);" +
            "       float tn_dot_ldir = max(dot(tnorm, light_direction), 0.0);" +
            "       viewer_vector = vec3(-eye_coordinates.xyz);" +
            "   }" +
            "   gl_Position = u_p_matrix * u_v_matrix * u_m_matrix * vPosition;" +
            "   out_Texcoord = vTexcoord;" +
            "   out_Color = vec4(1.0);" +
            "}";

        this.vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(this.vertexShaderObject);

        if (!gl.getShaderParameter(this.vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.vertexShaderObject);
            if (error.length > 0) {
                alert(error);
                uninitialize();
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es" +
            "\n" +
            "precision highp float;" +
            "precision highp int;" +
            "in vec2 out_Texcoord;" +
            "in vec4 out_Color;" +
            "in vec3 tnorm;" +
            "in vec3 light_direction;" +
            "in vec3 viewer_vector;" +
            "uniform vec3 u_la;" +
            "uniform vec3 u_ld;" +
            "uniform vec3 u_ls;" +
            "uniform vec3 u_ka;" +
            "uniform vec3 u_kd;" +
            "uniform vec3 u_ks;" +
            "uniform float u_shininess;" +
            "uniform int u_enable_light;" +
            "uniform sampler2D u_sampler;" +
            "out vec4 FragColor;" +
            "void main (void)" +
            "{" +
            "   vec3 phong_ads_light = vec3(1.0);" +
            "   if (u_enable_light == 1) " +
            "   { " +
            "       vec3 ntnorm = normalize(tnorm);" +
            "       vec3 nlight_direction = normalize(light_direction);" +
            "       vec3 nviewer_vector = normalize(viewer_vector);" +
            "       vec3 reflection_vector = reflect(-nlight_direction, ntnorm);" +
            "       float tn_dot_ldir = max(dot(ntnorm, nlight_direction), 0.0);" +
            "       vec3 ambient  = u_la * u_ka;" +
            "       vec3 diffuse  = u_ld * u_kd * tn_dot_ldir;" +
            "       vec3 specular = u_ls * u_ks * pow(max(dot(reflection_vector, nviewer_vector), 0.0), u_shininess);" +
            "       phong_ads_light = ambient + diffuse + specular;" +
            "   }" +
            "   vec4 tex = texture(u_sampler, out_Texcoord);" +
            "   FragColor = vec4((vec3(tex) * vec3(out_Color) * phong_ads_light), 1.0);" +
            "}";

        this.fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(this.fragmentShaderObject);

        if (!gl.getShaderParameter(this.fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.fragmentShaderObject);
            if (error.length > 0) {
                alert(error);
                uninitialize();
            }
        }

        // shader program 
        this.shaderProgramObject = gl.createProgram();
        gl.attachShader(this.shaderProgramObject, this.vertexShaderObject);
        gl.attachShader(this.shaderProgramObject, this.fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_COLOR, "vColor");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTexcoord");

        // linking
        gl.linkProgram(this.shaderProgramObject);
        if (!gl.getProgramParameter(this.shaderProgramObject, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.shaderProgramObject);
            if (error.length > 0) {
                alert(error);
                uninitialize();
            }
        }

        // get unifrom locations
        this.mUniform = gl.getUniformLocation(this.shaderProgramObject, "u_m_matrix");
        this.vUniform = gl.getUniformLocation(this.shaderProgramObject, "u_v_matrix");
        this.pUniform = gl.getUniformLocation(this.shaderProgramObject, "u_p_matrix");

        this.samplerUniform = gl.getUniformLocation(this.shaderProgramObject, "u_sampler");

        this.laUniform = gl.getUniformLocation(this.shaderProgramObject, "u_la");
        this.kaUniform = gl.getUniformLocation(this.shaderProgramObject, "u_ka");
        this.ldUniform = gl.getUniformLocation(this.shaderProgramObject, "u_ld");
        this.kdUniform = gl.getUniformLocation(this.shaderProgramObject, "u_kd");
        this.lsUniform = gl.getUniformLocation(this.shaderProgramObject, "u_ls");
        this.ksUniform = gl.getUniformLocation(this.shaderProgramObject, "u_ks");
        this.shininessUniform = gl.getUniformLocation(this.shaderProgramObject, "u_shininess");

        this.enableLightUniform = gl.getUniformLocation(this.shaderProgramObject, "u_enable_light");
        this.lightPositionUniform = gl.getUniformLocation(this.shaderProgramObject, "u_light_position");

        // pyramid Position
        var cubeVertices = new Float32Array(jwModel.vertex);
        var cubeIndices = new Uint32Array(jwModel.index);
        this.numElements = jwModel.index.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
            3, // 3 for x,y,z axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 0 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_COLOR,
            3, // 3 for r,g,b axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 3 * 4); // stride and offset
        //gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_COLOR);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
            3, // 3 for x,y,z axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 3 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0,
            2, // 2 for s,t axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 6 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.vboElement = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        // load texture
        let tex = gl.createTexture();
        tex.image = new Image();
        tex.image.src = "res/johnny/albedo.png";
        tex.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        this.texDiff = tex;

        // tex = gl.createTexture();
        // let animTexSize = Math.sqrt(manModel.boneCount * manModel.frameCount * 4);
        // tex.image = new Image();
        // gl.bindTexture(gl.TEXTURE_2D, tex);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.FLOAT, manModel.animation);
        // gl.bindTexture(gl.TEXTURE_2D, null);
        // this.texAnim = tex;

    },

    uninit: function () {
        gl.deleteTexture(this.texDiff);
    
        if (this.vaoCube) {
            gl.deleteVertexArray(this.vaoCube);
            this.vaoCube = null;
        }
    
        if (this.vboCube) {
            gl.deleteBuffer(this.vboCube);
            this.vboCube = null;
        }
    
        if (this.vboElement) {
            gl.deleteBuffer(this.vboElement);
            this.vboElement = null;
        }
    
        if (this.shaderProgramObject) {
            if (this.fragmentShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.fragmentShaderObject);
                gl.deleteShader(this.fragmentShaderObject);
                this.fragmentShaderObject = null;
            }
    
            if (this.vertexShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.vertexShaderObject);
                gl.deleteShader(this.vertexShaderObject);
                this.vertexShaderObject = null;
            }
    
            gl.deleteProgram(this.shaderProgramObject);
            this.shaderProgramObject = null;
        }
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {
        gl.useProgram(this.shaderProgramObject);

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(-90.0))
        //mat4.rotateZ(modelMatrix, modelMatrix, toRadians(this.angleCube));
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        viewMatrix = camera.getViewMatrix();

        gl.uniformMatrix4fv(this.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(this.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(this.pUniform, false, this.perspectiveProjectionMatrix);

        gl.uniform3fv(this.laUniform, this.lightAmbient);
        gl.uniform3fv(this.ldUniform, this.lightDiffuse);
        gl.uniform3fv(this.lsUniform, this.lightSpecular);
        gl.uniform4fv(this.lightPositionUniform, this.lightPosition);

        gl.uniform3fv(this.kaUniform, this.materialAmbient);
        gl.uniform3fv(this.kdUniform, this.materialDiffuse);
        gl.uniform3fv(this.ksUniform, this.materialSpecular);
        gl.uniform1f(this.shininessUniform, this.materialShininess);

        if (this.bLight == true)
            gl.uniform1i(this.enableLightUniform, 1);
        else
            gl.uniform1i(this.enableLightUniform, 0);

        // bind with textures
        gl.bindTexture(gl.TEXTURE_2D, this.texDiff);
        gl.uniform1i(this.samplerUniform, 0);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    },

    update: function () {
        this.angleCube += 1.0;
        if (this.angleCube >= 360.0) {
            this.angleCube = 0.0;
            // return true;
        }
        return false;
    },
}
