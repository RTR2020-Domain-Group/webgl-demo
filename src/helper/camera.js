// directions
const FORWARD = 0;
const BACKWARD = 1;
const LEFT = 2;
const RIGHT = 3;

// camera default values
const CAMERA_YAW = -90.0;
const CAMERA_PITCH = 0.0;
const CAMERA_SPEED = 1.0;
const CAMERA_SENSITIVITY = 0.25;
const CAMERA_ZOOM = 10.0;

const camera = {
    // camera properties
    Position: vec3.create(),
    Front: vec3.create(),
    Up: vec3.create(),
    Right: vec3.create(),
    WorldUp: vec3.create(),

    // euler angles
    Yaw: 0.0,
    Pitch: 0.0,

    // camera options
    MovementSpeed: CAMERA_SPEED,
    MouseSensitivity: CAMERA_SENSITIVITY,
    Zoom: CAMERA_ZOOM,

    updateCameraVectors: function () {
        let v = vec3.create();
        v[0] = Math.cos(toRadians(this.Yaw)) * Math.cos(toRadians(this.Pitch));
        v[1] = Math.sin(toRadians(this.Pitch));
        v[2] = Math.sin(toRadians(this.Yaw)) * Math.cos(toRadians(this.Pitch));
        vec3.normalize(this.Front, v);

        // calculate the right and up vectors
        vec3.cross(v, this.Front, this.WorldUp)
        vec3.normalize(this.Right, v);

        vec3.cross(v, this.Right, this.Front)
        vec3.normalize(this.Up, v);
    },

    init: function (pos, up) {
        this.Position = pos;
        this.WorldUp = up;
        this.Yaw = CAMERA_YAW;
        this.Pitch = CAMERA_PITCH;
        this.Front = vec3.fromValues(0.0, 0.0, -1.0);

        this.updateCameraVectors();
    },

    getViewMatrix: function () {
        let m = mat4.create();
        let v = vec3.create();
        vec3.add(v, this.Position, this.Front)

        return mat4.lookAt(m, this.Position, v, this.Up);
    },

    getViewMatrixNoTranslate: function () {
        var vMat = this.getViewMatrix();
        vMat[12] = vMat[13] = vMat[14] = 0.0;
        return vMat;
    },

    processKeyboard: function (dir) {
        if (dir == FORWARD) {
            vec3.add(this.Position, this.Position, this.Front);
        }
        if (dir == BACKWARD) {
            vec3.sub(this.Position, this.Position, this.Front);
        }
        if (dir == LEFT) {
            vec3.sub(this.Position, this.Position, this.Right);
        }
        if (dir == RIGHT) {
            vec3.add(this.Position, this.Position, this.Right);
        }
    },

    processMouse: function (xoff, yoff) {
        xoff *= this.MouseSensitivity;
        yoff *= this.MouseSensitivity;

        this.Yaw += xoff;
        this.Pitch -= yoff;

        if (this.Pitch > 89.0) this.Pitch = 89.0;
        if (this.Pitch < -89.0) this.Pitch = -89.0;

        //console.log('Pitch', this.Pitch, 'Yaw', this.Yaw);

        this.updateCameraVectors();
    },

    print: function () {
        console.log(camera);
    }
};


