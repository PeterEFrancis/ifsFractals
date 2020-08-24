class Fractal {


  constructor(cartesian, error_el, tw) {

    this.cartesian = cartesian;
    this.parser = parser;
    this.error_el = error_el;

    this.errors = ["number of points to plot must be a whole positive number",
                   "refresh rate must be a positive whole number",
                   "one or more specified transformtions is not a contraction mapping (check the console for more info)",
                   "no transformations defined"
                  ];
    this.current_errors = [0, 0, 0, 0];

    this.tw;
    this.running_weights;
    this.set_TW(tw);

    this.number_of_points = 10000;
    this.refresh_rate = 10;

    this.updateID;
    this.moving = false;


  }

  set_error(num) {
    this.current_errors[num] = 1;
    this.display_errors();
  }

  remove_error(num) {
    this.current_errors[num] = 0;
    this.display_errors();
  }

  display_errors() {
    var is_error = false;
    for (var i = 0; i < 6; i++) {
      if (this.current_errors[i] == 1) {
        this.error_el.innerHTML = '<span class="glyphicon glyphicon-warning-sign"></span> ' + this.errors[i];
        is_error = true;
        break;
      }
    }
    if (!is_error) {
      this.error_el.innerHTML = "";
    }
  }

  set_TW(tw) {

    if (tw.transformations == []) {
      this.set_error(3);
    } else {
      this.remove_error(3);
    }

    // check for non-contraction mappings
    var which_not_c_maps = this.which_are_not_contraction_mappings(tw.transformations);
    if (which_not_c_maps = []) {
      this.tw = tw;
      this.remove_error(2);

      var sum = this.tw.weights.reduce((a, b) => a + b, 0);

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

    } else {
      set_error(2);
      console.log("transformations ("  + which_not_c_maps + ") are not contraction mappings");
    }


  }

  opNorm(T) {
    // get 2 x 2 matric (classic theorem 1.10!)
    var M = [[0,0],[0,0]];
    var t_e1 = T({x:1, y:0});
    M[0][0] = t_e1.x;
    M[1][0] = t_e1.y;
    var t_e2 = T({x:0, y:1});
    M[0][1] = t_e2.x;
    M[1][1] = t_e2.y;
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


  start() {
    this.pause();
    var frac = this;
    this.updateID = setInterval(function() {frac.plot_fractal()}, this.refresh_rate);
    this.moving = true;
  }

  pause() {
    clearInterval(this.updateID);
    this.moving = false;
  }

  set_number_of_points(num) {
    if (isNaN(num) || num <= 0 || Math.round(num) != num) {
      this.set_error(0);
    } else {
      this.remove_error(0);
      this.number_of_points = num;
      if (this.moving) {
        this.start();
      }
    }
  }

  set_refresh_rate(num) {
    if (isNaN(num) || num <= 0 || Math.round(num) != num) {
      this.set_error(1);
    } else {
      this.remove_error(1);
      this.refresh_rate = num;
      if (this.moving) {
        this.start();
      }
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
    for (var i = 0; i < this.number_of_points; i++) {
      p = this.tw.transformations[this.get_transformation_number()](p);
      this.cartesian.plot(p.x, p.y);
    }
  }




}
