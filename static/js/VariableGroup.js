
class VariableSlider {

  // a = [ 2 ]                                            (trash)
  // [ lb ] ----------o---------------- [ ub ]     step: [ step ]


  constructor(name, group) {
    this.name = name;
    this.group = group;
    this.variable_container = document.createElement('div');


    // error handling
    this.errors = ["min value must be an number",
                   "cannot set min to be greater than or equal to max",
                   "max value must be an number",
                   "cannot set max to be less than or equal to min",
                   "variable value must be a number",
                   "step value must be a number"
                  ];
    this.current_errors = [0,0,0,0,0,0];

    // create elements
    var top_row = document.createElement('div');
      var name_col = document.createElement('div');
        var name_input_group = document.createElement('div');
          var name_addon = document.createElement('span');
          this.name_input = document.createElement('input');
      var trash_col = document.createElement('div');
        var trash_link = document.createElement('a');
          var trash_icon = document.createElement('span');
    var bottom_row = document.createElement('div');
      var lower_bound_col = document.createElement('div');
        this.lower_bound_input = document.createElement('input');
      var slider_col = document.createElement('div');
        this.slider = document.createElement('input');
      var upper_bound_col = document.createElement('div');
        this.upper_bound_input = document.createElement('input');
      var step_col = document.createElement('div');
        var step_input_group = document.createElement('div');
          var step_addon = document.createElement('span');
          this.step_input = document.createElement('input');
      this.error = document.createElement('p');


    // place elements (containments)
    this.variable_container.appendChild(top_row);
      top_row.appendChild(name_col);
        name_col.appendChild(name_input_group)
          name_input_group.appendChild(name_addon);
          name_input_group.appendChild(this.name_input);
      top_row.appendChild(step_col);
        step_col.appendChild(step_input_group);
          step_input_group.appendChild(step_addon);
          step_input_group.appendChild(this.step_input);
      top_row.appendChild(trash_col);
        trash_col.appendChild(trash_link);
          trash_link.appendChild(trash_icon);
    this.variable_container.appendChild(bottom_row);
      bottom_row.appendChild(lower_bound_col);
        lower_bound_col.appendChild(this.lower_bound_input);
      bottom_row.appendChild(slider_col);
        slider_col.appendChild(this.slider);
      bottom_row.appendChild(upper_bound_col);
        upper_bound_col.appendChild(this.upper_bound_input);
    this.variable_container.appendChild(this.error);


    // add text
    name_addon.appendChild(document.createTextNode(this.name));
    step_addon.innerHTML = '&Delta;';


    // style elements
    this.variable_container.classList.add('variable-container');
    this.variable_container.classList.add('container-fluid');
    top_row.classList.add('row');
      name_col.classList.add('col-xs-4');
        name_input_group.classList.add('input-group');
          name_addon.classList.add('input-group-addon');
          name_addon.classList.add('name-input-group-addon');
          this.name_input.classList.add('form-control')
          this.name_input.setAttribute('type', 'text');
      step_col.classList.add('col-xs-5');
        step_input_group.classList.add('input-group');
        step_input_group.classList.add('step-input-group');
          step_addon.classList.add('input-group-addon');
          this.step_input.classList.add('form-control')
          this.step_input.setAttribute('type', 'text');
      trash_col.classList.add('col-xs-3');
      trash_col.classList.add('text-right');
        trash_link.classList.add('btn');
        trash_link.classList.add('trash-link');
          trash_icon.classList.add('glyphicon');
          trash_icon.classList.add('glyphicon-trash');
    bottom_row.classList.add('row');
    bottom_row.classList.add('slider-row');
      lower_bound_col.classList.add('col-xs-2');
        this.lower_bound_input.classList.add('form-control');
        this.lower_bound_input.classList.add('bound');
      slider_col.classList.add('col-xs-8');
        this.slider.setAttribute('type', 'range');
        this.slider.classList.add('slider');
      upper_bound_col.classList.add('col-xs-2');
        this.upper_bound_input.classList.add('form-control');
        this.upper_bound_input.classList.add('bound');
    this.error.classList.add('variable-slider-error');


    // set default values
    this.name_input.value = 1;
    this.lower_bound_input.value = 0;
    this.slider.min = 0;
    this.upper_bound_input.value = 1;
    this.slider.max = 1;
    this.step_input.value = 0.01;
    this.slider.step = 0.01;


    // make elements active
    var vars = this;
    trash_link.onclick = function() {
      vars.delete();
    }
    this.name_input.onchange = function() {
      vars.set_value(vars.name_input.value);
      vars.group.onchange();
    }
    this.slider.oninput = function() {
      vars.set_value(vars.slider.value);
      vars.group.onchange();
    }
    this.lower_bound_input.onchange = function() {
      vars.set_min(vars.lower_bound_input.value);
      console.log(vars.lower_bound_input.value);
    }
    this.upper_bound_input.onchange = function() {
      vars.set_max(vars.upper_bound_input.value);
    }
    this.step_input.onchange = function() {
      vars.set_step(vars.step_input.value);
    }

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
        this.error.innerHTML = '<span class="glyphicon glyphicon-warning-sign"></span> ' + this.errors[i];
        is_error = true;
        break;
      }
    }
    if (!is_error) {
      this.error.innerHTML = "";
    }
  }


  set_min(m) {
    if (m == "") {
      this.set_min(this.slider.min);
    } else if (isNaN(m)) {
      this.set_error(0);
    } else if (m >= this.slider.max) {
      this.set_error(1);
    } else {
      this.remove_error(0);
      this.remove_error(1);
      this.slider.min = m;
      this.lower_bound_input.value = m;
    }
  }

  get_min() {
    return Number(this.slider.min);
  }

  set_max(m) {
    if (m == "") {
      this.set_max(this.slider.max);
    } else if (isNaN(m)) {
      this.set_error(2);
    } else if (m <= this.slider.min) {
      this.set_error(3);
    } else {
      this.remove_error(2);
      this.remove_error(3);
      this.slider.max = m;
      this.upper_bound_input.value = m;
    }
  }

  get_max() {
    return Number(this.slider.max);
  }

  set_value(val) {
    if (isNaN(val)) {
      this.set_error(4);
    } else {
      this.remove_error(4);
      if (val < this.get_min()) {
        this.set_min(val);
      }
      if (val > this.get_max()) {
        this.set_max(val);
      }
      this.name_input.value = val;
      this.slider.value = val;
    }
  }

  set_step(s) {
    if (isNaN(s)) {
      this.set_error(5);
    } else {
      this.remove_error(5);
      this.slider.step = s;
      this.step_input.value = s;
    }
  }

  get_value() {
    return this.slider.value;
  }

  delete() {
    this.group.delete(this.name);
  }


}




class VariableGroup {

  constructor(container) {
    this.container = container;
    this.variables = {};
    this.onchange = function() {};
  }

  var_name_exists(name) {
    return name in this.variables;
  }

  add_variable(name) {
    if (this.var_name_exists(name)) {
      throw "cannot create a duplicate variable name";
    } else {
      var new_vars = new VariableSlider(name, this);
      this.variables[name] = new_vars;
      this.container.appendChild(new_vars.variable_container);
      var line = document.createElement('hr');
      line.setAttribute('id', 'variable-separator-line-' + name);
      line.classList.add('variable-separator');
      this.container.appendChild(line);
    }
  }

  add_next_variable() {
    var count = 0;
    for (var i in this.variables) {
      count++;
    }
    if (count == 26) {
      throw "cannot add more than 26 variables";
    } else {
      for (var i = 0; i < 26; i++) {
        var letter = "abcdefghijklmnopqrstuvwxyz".substring(i, i + 1);
        if (!this.var_name_exists(letter)) {
          this.add_variable(letter);
          break;
        }
      }
    }
  }


  get_values() {
    var vars = {};
    for (var v in this.variables) {
      vars[v] = this.variables[v].get_value();
    }
    return vars;
  }


  delete(name) {
    if (!this.var_name_exists(name)) {
      throw "cannot delete variable that doesn't exist";
    } else {
      // remove from HTML
      this.variables[name].variable_container.remove();
      // remove from list of variables
      delete this.variables[name];
      // remove hr
      document.getElementById('variable-separator-line-' + name).remove();
    }
  }

}
