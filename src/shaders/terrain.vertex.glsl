uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;

attribute vec3 position;
varying float vElevation;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float elevation = sin(modelPosition.x * 0.2) * 0.5;
  elevation += sin((modelPosition.z * 0.2) - uTime) * 0.5;

  vElevation = elevation;
  modelPosition.y += elevation;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 worldPosition = projectionMatrix * viewPosition;

  gl_Position = worldPosition;
}