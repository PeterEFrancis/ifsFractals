
// https://guppy.js.org/site/api/guppy-js/2.0.0-rc.1/Guppy.html#.add_global_symbol
const SYMBOLS = {"Scale": {"output": {"latex":"\\text{Scale}\\left({$1}\\right)", "text":"Scale($1)"}, "attrs": { "type":"Scale", "group":"function"}},
                 "ScaleX": {"output": {"latex":"\\text{ScaleX}\\left({$1}\\right)", "text":"ScaleX($1)"}, "attrs": { "type":"ScaleX", "group":"function"}},
                 "ScaleY": {"output": {"latex":"\\text{ScaleY}\\left({$1}\\right)", "text":"ScaleY($1)"}, "attrs": { "type":"ScaleY", "group":"function"}},
                 "ScaleXY": {"output": {"latex":"\\text{ScaleXY}\\left({$1}, {$2}\\right)", "text":"ScaleXY($1)"}, "attrs": { "type":"ScaleXY", "group":"function"}},
                 "Translate": {"output": {"latex":"\\text{Translate}\\left({$1}, {$2}\\right)", "text":"Translate($1, $2)"}, "attrs": { "type":"Translate", "group":"function"}},
                 "Rotate": {"output": {"latex":"\\text{Rotate}\\left({$1}\\right)", "text":"Rotate($1)"}, "attrs": { "type":"Rotate", "group":"function"}},
                 "ShearX": {"output": {"latex":"\\text{ShearX}\\left({$1}\\right)", "text":"ShearX($1)"}, "attrs": { "type":"ShearX", "group":"function"}},
                 "ShearY": {"output": {"latex":"\\text{ShearY}\\left({$1}\\right)", "text":"ShearY($1)"}, "attrs": { "type":"ShearY", "group":"function"}},
                 "M": {"output": {"latex":"\\text{M}\\left({$1}, {$2}, {$3}, {$4}, {$5}, {$6}\\right)", "text":"M($1, $2, $3, $4, $5, $6)"}, "attrs": { "type":"M", "group":"function"}},
                }

class TWRow {

  constructor(id, row_container) {

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
          this.weight.value = 0;
          var ths = this;
          this.weight.onchange = function() {
            if (ths.weight.value == "") {
              ths.weight.value = 0;
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

    // add all of the necessary symbols and functions
    for (var func in SYMBOLS) {
      this.guppy.engine.add_symbol(func, SYMBOLS[func]);
    }

  }

  delete() {
    this.tr.remove();
    delete this;
  }

  get_weight() {
    return Number(this.weight.value);
  }

  set_weight(num) {
    this.weight.value = num;
  }

  get_transformation() {

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
  }

  add_row() {
    // find an available ID
    var id = this.all_rows.length;
    // create and place a new row
    var new_row = new TWRow(id, this.table);
    this.all_rows.push(new_row);
    // this.table.appendChild(new_row.tr); <--- this is now done in TWRow (thanks a lot, Guppy :( )
  }

  get_all_content(type) {
    // "type" is from Guppy - ex: 'latex', 'ast', 'text'
    var output = {};
    for (var i in this.all_rows) {
      try {
        output[i] = this.all_rows[i].guppy.engine.get_content(type);
      } catch(e) {}
    }
    return output;
  }

  get_TW() {
    // get content

    var weights = [];
    for (var i = 0; i < this.all_rows.length; i++) {
      weights.push(this.all_rows[i].get_weight());
    }



    // use parser to parse math

    // return list of transformations
    return {transformations: [M(0,0,0,0.16,0,0),
                              M(0.85,0.04,-0.04,0.85,0,1.60),
                              M(0.20,-0.26,0.23,0.22,0,1.60),
                              M(-0.15,0.28,0.26,0.24,0,0.44,0.07)],
            weights: weights};
  }

}
