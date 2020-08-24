
// matrix calculations for 2 x 2 matrices

function trace(M) {
  return M[0][0] + M[1][1]
}

function det(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

function eigenvalues(M) {
  var t = trace(M);
  var d = det(M);
  var s = Math.sqrt(Math.pow(t, 2) - 4 * d);
  return [(t + s) / 2, (t - s) / 2];
}
