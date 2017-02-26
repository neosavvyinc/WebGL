// Start time
var time0 = (new Date()).getTime() / 1000;

/**
 * Function that pulls out text content from a DOM element
 * @param id - ID of the DOM element
 * @returns {string}
 */
function getStringFromDOMElement(id) {
    var node = document.getElementById(id);

    // Recurse and get all text in the node
    var recurseThroughDOMNode = function recurseThroughDOMNode(childNode, textContext) {
        if (childNode) {
            if (childNode.nodeType === 3) {
                textContext += childNode.textContent;
            }
            return recurseThroughDOMNode(childNode.nextSibling, textContext);
        } else {
            return textContext;
        }
    };
    return recurseThroughDOMNode(node.firstChild, '');
}

/**
 * Create and attach a shader to gl program
 * @param gl
 * @param program
 * @param type
 * @param src
 */
function addshader(gl, program, type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
    }
    gl.attachShader(program, shader);
}

/**
 * Function that creates and links the gl program with the
 * application's vertex and fragment shader.
 * @param gl
 * @param vertexShader
 * @param fragmentShader
 */
function gl_init(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    var buffer = gl.createBuffer();
    addshader(gl, program, gl.VERTEX_SHADER, vertexShader);
    addshader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
    gl.linkProgram(program);

    if (! gl.getProgramParameter(program, gl.LINK_STATUS))
        throw "Could not link the shader program!";
    gl.useProgram(program);

    // Create a square as a strip of two triangles.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1,1,
            0,1,
            1,0,
            -1,-1,
            0,1,
            -1,0]),
        gl.STATIC_DRAW
    );

    gl.aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(gl.aPosition);
    gl.vertexAttribPointer(gl.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uTime = gl.getUniformLocation(program, "uTime");
}

/**
 * This function is called once per frame.
 * @param gl
 */
function gl_update(gl) {
    gl.uniform1f(gl.uTime, (new Date()).getTime() / 1000 - time0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Start the next frame
    requestAnimFrame(function() { gl_update(gl); });
}

function start_gl(canvas_id, vertexShader, fragmentShader) {
    // Make sure the browser supports WebGL.
    try {
        var canvas = document.getElementById(canvas_id);
        var gl = canvas.getContext("experimental-webgl");
    } catch (e) {
        throw "Sorry, your browser does not support WebGL.";
    }

    // Initialize gl. Then start the frame loop.
    gl_init(gl, vertexShader, fragmentShader);
    gl_update(gl);
}

// A browser-independent way to call a function after 1/60 second.
requestAnimFrame = (function() {
    return requestAnimationFrame
        || webkitRequestAnimationFrame
        || mozRequestAnimationFrame
        || oRequestAnimationFrame
        || msRequestAnimationFrame
        || function(callback) {
               setTimeout(callback, 1000 / 60);
           }; })();
