
// requires mathjs

function replace_all(string, a, b) {
  while (string.includes(a)) {
    string = string.replace(a,b);
  }
  return string;
}


class Parser {

  constructor(variable_group) {
    this.variable_group = variable_group;
  }

  parse(string) { // TODO: make this much much much better
    console.log(string);
    var vals = this.variable_group.get_values();
    string = replace_all(string, 'neg', '(-1)');
    string = replace_all(string, 'squareroot', 'sqrt');
    return math.evaluate(string, vals);
  }

}
