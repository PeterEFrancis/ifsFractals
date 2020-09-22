
class Cartesian {

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.set_color("black");
    this.zoom = 50; // image / real
    this.save = true;
    this.on_zoom_change = function() {};
    this.on_mouse_over = function() {};
    this.on_mouse_out = function() {};
    this.center = {x:0, y:0};
    this.points = [];
    this.clear();
    this.hover = {x: null, y: null};
    this.mousedown = false;
    this.mousedown_loc = {};
    var cart = this;
    this.canvas.addEventListener('mousedown', function(e) {
      cart.mousedown = true;
      var rect = canvas.getBoundingClientRect();
      var user_x = (e.clientX - rect.left) * (cart.canvas.width / cart.canvas.clientWidth);
      var user_y = (e.clientY - rect.top) * (cart.canvas.height / cart.canvas.clientHeight);
      cart.mousedown_loc = cart.get_real_point(user_x, user_y);
    });
    this.canvas.addEventListener('mouseup', function(e) {
      cart.mousedown = false;
    });
    this.canvas.addEventListener('mouseout', function() {
      cart.hover = {x:null, y:null};
      cart.mousedown = false;
      cart.on_mouse_out();
    });
    this.canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      var user_x = (e.clientX - rect.left) * (cart.canvas.width / cart.canvas.clientWidth);
      var user_y = (e.clientY - rect.top) * (cart.canvas.height / cart.canvas.clientHeight);
      if (cart.mousedown) {
        var rp = cart.get_real_point(user_x, user_y);
        cart.center_at({x:cart.center.x - (rp.x - cart.mousedown_loc.x),
                        y:cart.center.y - (rp.y - cart.mousedown_loc.y)});
      } else {
        cart.hover = cart.get_real_point(user_x, user_y);
      }
      cart.on_mouse_over();
    });
    this.canvas.addEventListener('dblclick', function(e) {
      // recenter
      var rect = canvas.getBoundingClientRect();
      var user_x = (e.clientX - rect.left) * (cart.canvas.width / cart.canvas.clientWidth);
      var user_y = (e.clientY - rect.top) * (cart.canvas.height / cart.canvas.clientHeight);
      cart.center_at(cart.get_real_point(user_x, user_y));
      // zoom 2x
      cart.zoom_to(cart.zoom * 2);
    });
    this.canvas.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      cart.zoom_to(cart.zoom / 2);
    });
  }

  draw_origin() {
    var o = this.get_plot_point(0,0);
    const len = 50;
    this.ctx.lineWidth = "1";
    this.ctx.beginPath();
    this.ctx.arc(o.x, o.y, 10, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.moveTo(o.x,o.y + len);
    this.ctx.lineTo(o.x,o.y - len);
    this.ctx.stroke();
    this.ctx.moveTo(o.x + len, o.y);
    this.ctx.lineTo(o.x - len, o.y);
    this.ctx.stroke();
  }

  clear() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.points = [];
  }

  redraw_points() {
    var points = [...this.points];
    this.clear();
    for (var i = 0; i < points.length; i++) {
      this.plot(points[i][0], points[i][1]);
    }
  }

  set_color(color) {
    this.ctx.fillStyle = color;
  }

  center_at(xy) {
    this.center = xy;
    this.redraw_points();
  }

  zoom_to(z) {
    this.zoom = z;
    this.redraw_points();
    this.on_zoom_change();
  }

  plot(realX, realY) {
    var plot_point = this.get_plot_point(realX, realY);
    this.ctx.fillRect(plot_point.x, plot_point.y, 1, 1);
    if (this.save) {
      this.points.push([realX, realY]);
    }
  }

  get_plot_point(realX, realY) {
    var x = this.canvas.width / 2 + (realX - this.center.x) * this.zoom;
    var y = this.canvas.height / 2 - (realY - this.center.y) * this.zoom;
    return {x:x, y:y};
  }

  get_real_point(x, y) {
    var realX = (x - this.canvas.width / 2) / this.zoom + this.center.x;
    var realY = (this.canvas.height / 2 - y) / this.zoom + this.center.y;
    return {x: realX, y:realY}
  }

  recenter() {
    this.zoom_to(50);
    this.center_at({x:0,y:0});
  }


  set_with_bounds(bounds, padding) {
    // zoom out and center, so all of the bounds are included, with an optional padding

    // center at center of bounds
    const new_center = {
      x: (bounds.ub_x + bounds.lb_x) / 2,
      y: (bounds.ub_y + bounds.lb_y) / 2
    };
    this.center_at(new_center);

    // look through distances from center to bounds (plus possible padding)
    var effective_bounds = {};
    for (var b in bounds) {
      effective_bounds[b] = bounds[b] + (padding && isNaN(padding) ? padding[b] : 0);
    }
    var new_zoom = Infinity;
    for (var v in effective_bounds) {
      const this_zoom = ((v[3] == "x" ? this.canvas.width : this.canvas.height) / 2) / Math.abs(effective_bounds[v] - new_center[v[3]]);
      if (this_zoom < new_zoom) {
        new_zoom = this_zoom;
      }
    }
    if (padding && !isNaN(padding)) {
      // padding then specifies a zoom multiplier
      new_zoom = new_zoom * padding;
    }
    this.zoom_to(new_zoom);
  }

  download() {
    var link = document.createElement('a');
    link.download = 'ifs-fractals.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }

}
