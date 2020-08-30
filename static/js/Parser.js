// requires mathjs

class Parser {

  constructor(variable_group) {
    this.variable_group = variable_group;
  }

  parse(string) { // TODO: make this much much much better
    var vals = this.variable_group.get_values();
    vals['neg'] = -1;
    return math.evaluate(string, vals);
  }


}
