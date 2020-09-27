
function Scale(s) {
  return function(p) {
    return {x: p.x * s,
            y: p.y * s};
  };
}

function XScale(s) {
  return function(p) {
    return {x: p.x * s,
            y: p.y};
  };
}

function YScale(s) {
  return function(p) {
    return {x: p.x,
            y: p.y * s};
  };
}

function XYScale(s,t) {
  return function(p) {
    return {x: p.x * s,
            y: p.y * t};
  };
}

function Translate(h,k) {
  return function(p) {
    return {x: p.x + h,
            y: p.y + k};
  };
}

function Rotate(theta) {
  return function(p) {
    return {x: p.x * Math.cos(theta) - p.y * Math.sin(theta),
            y: p.x * Math.sin(theta) + p.y * Math.cos(theta)};
  };
}

function XShear(t) {
  return function(p) {
    return {x: p.x + p.y * t,
            y: p.y};
  };
}

function YShear(t) {
  return function(p) {
    return {x: p.x,
            y: p.y + p.x * t};
  };
}

function M(a, b, c, d, f, g) {
  return function(p) {
    return {x: a * p.x + b * p.y + f,
            y: c * p.x + d * p.y + g};
  };
}

function compose(ts) {
  return function(p) {
    for (var i = 0; i < ts.length; i++) {
      p = ts[ts.length - 1 - i](p);
    }
    return p;
  }
}
