
// https://guppy.js.org/site/api/guppy-js/2.0.0-rc.1/Guppy.html#.add_global_symbol
const SYMBOLS = {
  "Scale": {"output": {"latex":"\\text{Scale}\\left({$1}\\right)", "text":"Scale($1)"}, "attrs": { "type":"Scale", "group":"function"}},
  "XScale": {"output": {"latex":"\\text{XScale}\\left({$1}\\right)", "text":"XScale($1)"}, "attrs": { "type":"XScale", "group":"function"}},
  "YScale": {"output": {"latex":"\\text{YScale}\\left({$1}\\right)", "text":"YScale($1)"}, "attrs": { "type":"YScale", "group":"function"}},
  "XYScale": {"output": {"latex":"\\text{XYScale}\\left({$1}, {$2}\\right)", "text":"XYScale($1)"}, "attrs": { "type":"XYScale", "group":"function"}},
  "Translate": {"output": {"latex":"\\text{Translate}\\left({$1}, {$2}\\right)", "text":"Translate($1, $2)"}, "attrs": { "type":"Translate", "group":"function"}},
  "Rotate": {"output": {"latex":"\\text{Rotate}\\left({$1}\\right)", "text":"Rotate($1)"}, "attrs": { "type":"Rotate", "group":"function"}},
  "XShear": {"output": {"latex":"\\text{XShear}\\left({$1}\\right)", "text":"XShear($1)"}, "attrs": { "type":"XShear", "group":"function"}},
  "YShear": {"output": {"latex":"\\text{YShear}\\left({$1}\\right)", "text":"YShear($1)"}, "attrs": { "type":"YShear", "group":"function"}},
  "M": {"output": {"latex":"\\text{M}\\left({$1}, {$2}, {$3}, {$4}, {$5}, {$6}\\right)", "text":"M($1, $2, $3, $4, $5, $6)"}, "attrs": { "type":"M", "group":"function"}},
}

class TWRow {

  constructor(id, row_container, parser, group) {

    this.id = id;

    var ths = this;

    this.parser = parser;
    this.group = group;

    // create physical row
    this.tr = document.createElement('tr');
      this.tr.setAttribute('id', 'TW-row-' + id);
      var guppy_container = document.createElement('td');
        guppy_container.classList.add("guppy-container");
        var div = document.createElement('div');
          div.classList.add("transformation-dialogue");
          div.setAttribute('id', 'TW-row-guppy-div-' + id);
        guppy_container.appendChild(div);
      this.tr.appendChild(guppy_container);

      var weight_container = document.createElement('td');
        weight_container.classList.add("weight-container");
        this.weight = document.createElement('input');
          this.weight.setAttribute('id', 'TW-row-weight-' + id);
          this.weight.setAttribute('type', 'text');
          this.weight.classList.add("form-control");
          this.weight.value = 1;
          this.weight.onchange = function() {
            ths.group.onchange();
            if (ths.weight.value == "") {
              ths.weight.value = 1;
            }
          };
        weight_container.appendChild(this.weight);
      this.tr.appendChild(weight_container);

      var trash_container = document.createElement('td');
        trash_container.classList.add("trash-container");
        var trash_btn = document.createElement('a');
          var row = this;
          trash_btn.onclick = function() {
            row.delete();
          }
          trash_btn.classList.add("btn");
          trash_btn.classList.add("btn-link");
          var trash = document.createElement('span');
            trash.classList.add("glyphicon");
            trash.classList.add("glyphicon-trash");
          trash_btn.appendChild(trash);
        trash_container.appendChild(trash_btn);
      this.tr.appendChild(trash_container);

    // add row to container (necessary bc of guppy's id-lookup procedure :( )
    row_container.appendChild(this.tr);

    // create guppy backend
    this.guppy = new Guppy(div.id);
    this.guppy.event('change', function() {
      ths.group.onchange();
    })

    // add all of the necessary symbols and functions
    for (var func in SYMBOLS) {
      this.guppy.engine.add_symbol(func, SYMBOLS[func]);
    }


  }

  delete() {
    this.tr.remove();
    for (var i = 0; i < this.group.all_rows.length; i++) {
      if (this.id == this.group.all_rows[i].id) {
        this.group.all_rows.splice(i,1);
        break;
      }
    }
    this.group.onchange();
    delete this;
  }

  get_weight() {
    return this.parser.parse(this.weight.value);
  }

  set_weight(num) {
    this.weight.value = num;
  }

  split_into_list(functions_string) {
    var open_count = 0;
    var closed_count = 0;
    for (var i = 1; i < functions_string.length; i++) {
      if (functions_string[i] == '(') {
        open_count++;
      } else if (functions_string[i] == ')') {
        closed_count++;
      }
      if (open_count != 0 && open_count == closed_count) {
        var first;
        if (functions_string[1] != "(") {
          // base case -- only two functions are composed
          first = [functions_string.substring(1, i + 1)];
        } else {
          // recursively split (find the next set of parenthesis)
          first = [...this.split_into_list(functions_string.substring(1, i + 1))];
        }
        return [...first,
                functions_string.substring(i + 4, functions_string.length - 1)];
      }
    }
  }

  get_arg_map(f_list) {
    var arg_map = [];
    for (var i = 0; i < f_list.length; i++) {
      var o_paren = f_list[i].indexOf("(");
      arg_map.push([f_list[i].substring(0, o_paren),
                    f_list[i].substring(o_paren + 1, f_list[i].length - 1).split(",")]);
    }
    return arg_map;
  }

  get_transformation() {

    try {
      var entire_string = this.guppy.engine.get_content('text');
    } catch(e) {
      var entire_string = "";
      if (this.guppy.engine.get_content('latex') == " ") {
        throw "[ERROR: TWRow.js] transformation cannot be left empty";
      } else {
        throw "[ERROR: TWRow.js] there was a (guppy) error understanding the transfomation input.";
      }
    }


    if (entire_string == "") {
      return null;
    }


    try {
      // split functions
      var functions_string_list;
      if (entire_string[0] != "(") {
        // only one function
        functions_string_list = [entire_string];
      } else {
        functions_string_list = this.split_into_list(entire_string);
      }
    } catch(e) {
      throw "[ERROR: TWRow.js] there was an error dicerning which transformations you are trying to compose";
    }

    try {
      // create a list of ["function_name", [args]]
      var arg_map = this.get_arg_map(functions_string_list);
    } catch(e) {
      throw "[ERROR: TWRow.js] there was an error understanding a transformation argument";
    }


    try {
      // parse arg lists
      var parsed_arg_map = [];
      for (var i = 0; i < arg_map.length; i++) {
        var new_list = [];
        for (var j = 0; j < arg_map[i][1].length; j++) {
          new_list.push(this.parser.parse(arg_map[i][1][j]));
        }
        parsed_arg_map.push([arg_map[i][0], new_list]);
      }
    } catch(e) {
      throw "[ERROR: TWROW.js] there was an error parsing an argument";
    }


    try {
      // get list of functions (evaluate meta functions)
      var functions = [];
      for (var i = 0; i < parsed_arg_map.length; i++) {
        functions.push(eval(parsed_arg_map[i][0])(...parsed_arg_map[i][1]));
      }
    } catch(e) {
      throw "[ERROR: TWRow.js] there was an error evaluating a function";
    }

    // compose and return
    return compose(functions);

  }

  get_matrix() {
    return matrix_from_transformation(this.get_transformation());
  }

  get_factorization() {
    return factor_transformation(this.get_transformation());
  }

}



class TWRowGroup {

  constructor(table_container, parser) {
    this.table_container = table_container;
    this.table = document.createElement('table');
    this.table_container.appendChild(this.table);
    this.table.style.width = "100%";
    this.all_rows = [];
    this.parser = parser;
    this.onchange = function() {};
  }

  add_row() {
    // find an available ID
    var id = 0;
    while (true) {
      var matched = false;
      for (var i = 0; i < this.all_rows.length; i++) {
        if (this.all_rows[i].id == id) {
          matched = true;
          break;
        }
      }
      if (matched) {
        id++;
      } else {
        break;
      }
    }
    // create and place a new row
    var new_row = new TWRow(id, this.table, this.parser, this);
    this.all_rows.push(new_row);
    // this.table.appendChild(new_row.tr); <--- this is now done in TWRow -- thanks a lot, Guppy :(
    this.onchange();
  }

  get_all_content(type) {
    // "type" is from Guppy - ex: 'latex', 'ast', 'text'
    var output = [];
    for (var i in this.all_rows) {
      try {
        output[i] = this.all_rows[i].guppy.engine.get_content(type);
      } catch(e) {}
    }
    return output;
  }

  get_all_weight_text() {
    var output = [];
    for (var i in this.all_rows) {
      try {
        output[i] = this.all_rows[i].weight.value;
      } catch(e) {}
    }
    return output;
  }

  get_TW() {
    // get content

    var weights = [];
    var transformations = [];

    for (var i = 0; i < this.all_rows.length; i++) {
      var w = this.all_rows[i].get_weight();
      if (w != 0) {
        var t = this.all_rows[i].get_transformation();
        if (t != null) {
          weights.push(w);
          transformations.push(t);
        }
      }
    }

    // return list of transformations
    return {transformations: transformations, weights: weights};
  }

  get_matrices() {
    var matrices = [];
    for (var i in this.all_rows) {
      matrices.push(this.all_rows[i].get_matrix());
    }
    return matrices;
  }

  get_weights() {
    var s = 0;
    for (var i in this.all_rows) {
      s += this.all_rows[i].get_weight();
    }
    var w = [];
    for (var i in this.all_rows) {
      w.push(this.all_rows[i].get_weight() / s);
    }
    return w;
  }

  get_factorizations() {
    var factorizations = [];
    for (var i in this.all_rows) {
      factorizations.push(this.all_rows[i].get_factorization());
    }
    return factorizations;
  }

  delete_all() {
    const l = this.all_rows.length;
    for (var i = 0; i < l; i++) {
      this.all_rows[0].delete();
    }
  }

  auto_distribute_weights(delta) {
    var matrices = this.get_matrices();
    var maxs = [];
    for (var i = 0; i < matrices.length; i++) {
      maxs.push(Math.max(delta, Math.abs(det(two_by_two(matrices[i])))))
    }
    var s = maxs.reduce((a, b) => a + b, 0);
    var weights = [];
    for (var i = 0; i < maxs.length; i++) {
      weights.push(maxs[i] / s);
    }
    for (var i = 0; i < this.all_rows.length; i++) {
      this.all_rows[i].set_weight(round(weights[i],3));
    }
    this.onchange();
  }

}
