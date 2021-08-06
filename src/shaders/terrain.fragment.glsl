precision mediump float;

varying float vElevation;

uniform vec3 topColor;
uniform vec3 bottomColor;

void main(){
  float mixStreght = dot(vElevation, 0.5);
  vec3 color = mix(bottomColor, topColor, mixStreght);
  gl_FragColor = vec4(color, 1.0);
}