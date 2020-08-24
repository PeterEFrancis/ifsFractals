

class Parser {

  constructor(variable_group) {
    this.variable_group = variable_group;
  }

  parse(string) { // TODO: make this much much much better
    var vals = this.variable_group.get_values();
    if (string.substring(0,3) == "neg") {
      return -1 * this.parse(string.substring(4, string.length - 1));
    }
    if (string in vals) {
      return Number(vals[string]);
    }
    return Number(string);
  }


}
