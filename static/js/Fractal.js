class Fractal {


  constructor(cartesian, tw) {

    this.cartesian = cartesian;
    this.parser = parser;

    this.tw;
    this.running_weights;

    this.max_number_of_points = 10000;

    this.set_TW(tw);
  }

  set_TW(tw) {

    if (tw.transformations.legnth == 0) {
      throw "no transformations defined";
    }

    // check for non-contraction mappings
    var which_not_c_maps = this.which_are_not_contraction_mappings(tw.transformations);
    if (which_not_c_maps.length == 0) {
      this.tw = tw; // this means that the fractal object can edit the object you are giving it (so for example, if you load a fractal with un-normalized weights, this will normalize them.,)
      const sum = this.tw.weights.reduce((a, b) => a + b, 0);

      // make weights
      if (tw.weights.length == 0 || sum == 0) {
        tw.weights = [];
        for (var i = 0; i < tw.transformations.length; i++) {
          tw.weights.push(1 / tw.transformations.length);
        }
      } else {
        // normalize weights
        for (var i = 0; i < this.tw.weights.length; i++) {
          this.tw.weights[i] = this.tw.weights[i] / sum;
        }
      }

      // set running weights
      this.running_weights = [0];
      for (var i = 0; i < this.tw.weights.length; i++) {
        this.running_weights.push(this.running_weights[i] + this.tw.weights[i]);
      }
      this.running_weights.shift();

      this.plot_fractal();

    } else {
      throw "the transformations listed [" + which_not_c_maps + "] are not a contraction mappings"
    }


  }

  opNorm(T) {
    // get 2 x 2 matrix (classic theorem 1.10!)
    var M = [[0,0],[0,0]];
    var t_0 = T({x:0, y:0});
    var t_e1 = T({x:1, y:0});
    M[0][0] = t_e1.x - t_0.x;
    M[1][0] = t_e1.y - t_0.y;
    var t_e2 = T({x:0, y:1});
    M[0][1] = t_e2.x - t_0.x;
    M[1][1] = t_e2.y - t_0.y;
    M = mult(M, transpose(M));
    // return the square root of the largest eigenvalue
    return Math.sqrt(Math.max(...eigenvalues(M)));
  }

  which_are_not_contraction_mappings(transformations) {
    var which = [];
    for (var i = 0; i < transformations.length; i++) {
      if (this.opNorm(transformations[i]) >= 1) {
        which.push(i + 1) ;
      }
    }
    return which;
  }


  set_max_number_of_points(num) {
    if (isNaN(num) || num <= 0 || Math.round(num) != num) {
      throw "number of points to plot must be a whole positive number";
    } else {
      this.max_number_of_points = num;

      this.plot_fractal();

    }
  }


  get_transformation_number() {
    var r = Math.random();
    for (var i = 0; i < this.running_weights.length; i++) {
      if (r < this.running_weights[i]) {
        return i;
      }
    }
    throw "error with choosing random transformation";
  }

  plot_fractal() {
    cart.clear();
    // chaos game
    var p = {x: 1, y: 1};
    for (var i = 0; i < this.max_number_of_points; i++) {
      p = this.tw.transformations[this.get_transformation_number()](p);
      this.cartesian.plot(p.x, p.y);
    }
  }




}
