// init all shaders
function initShaders() {
    if (!TextureShader.init()) return false;
    if (!PBRshader.init()) return false;
    if (!PBRStaticShader.init()) return false;
    if (!SkyboxShader.init()) return false;
    return true;
}

// uninit all shaders
function uninitShaders() {
    SkyboxShader.uninit();
    TextureShader.uninit();
    PBRshader.uninit();
    PBRStaticShader.uninit();    
}
