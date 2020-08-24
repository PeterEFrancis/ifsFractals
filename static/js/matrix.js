
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

function transpose(M) {
  return [[M[0][0], M[1][0]],
          [M[0][1], M[1][1]]]
}

function mult(A, B) {
  var M = [];
  for (var i = 0; i < A.length; i++) {
    M.push([]);
    for (var j = 0; j < B[0].length; j++) {
      var s = 0;
      for (var k = 0; k < A[0].length; k++) {
        s += A[i][k] * B[k][j];
      }
      M[i][j] = s;
    }
  }
  return M;
}
