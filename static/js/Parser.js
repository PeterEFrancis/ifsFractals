
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

  parse(string) {
    var vals = this.variable_group.get_values();
    string = replace_all(string, 'neg', '(-1)');
    string = replace_all(string, 'squareroot', 'sqrt');
    return Number(math.evaluate(string, vals));
  }

}
