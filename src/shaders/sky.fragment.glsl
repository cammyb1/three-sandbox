precision mediump float;

varying vec3 vWorldPos;
uniform vec3 bottomColor;
uniform vec3 topColor;

void main(){
  float h = normalize(vWorldPos + 33.0).y;
  float mixStregth = max( pow( max( h , 0.0), 0.8 ), 0.0 );
  gl_FragColor = vec4( mix( bottomColor, topColor, mixStregth ), 1.0 );
}