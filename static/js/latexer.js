const labeled_tag_types = [
  'DEFINITION',
  'THEOREM'
];

class LaTeXer {

  constructor(container) {
    this.container = container;
  }

  render() {
    var nodes = LaTeX.childNodes;
    var labeled = {};
    var refs = {};

    // store labeled nodes
    var number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (labeled_tag_types.includes(nodes[i].tagName)) {
        labeled[number] = {
          title: nodes[i].id || null,
          type: nodes[i].tagName.charAt(0).toUpperCase() + nodes[i].tagName.slice(1).toLowerCase(),
          dom: nodes[i]
        }
        refs[nodes[i].id] = number;
        number++;
      }
    }

    // build and replace nodes
    for (var n = 1; n < number; n++) {
      var old_node = labeled[n];
      var blockquote = document.createElement('blockquote');
      var strong = document.createElement('strong');
      var text = document.createElement('p');
      strong.appendChild(document.createTextNode(old_node.type + " "));
      var a = document.createElement('a');
      a.appendChild(document.createTextNode(n));
      a.href = "#" + old_node.dom.id;
      strong.appendChild(a);
      strong.appendChild(document.createTextNode('.'));
      text.innerHTML = old_node.dom.innerHTML;
      blockquote.appendChild(strong);
      blockquote.appendChild(text);
      blockquote.id = old_node.dom.id;
      this.container.replaceChild(blockquote, old_node.dom);
    }

    // build references
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "REF") {
        var a = document.createElement('a');
        var to = nodes[i].getAttribute('to');
        a.href = "#" + to;
        var n = refs[to];
        a.innerHTML = n;
        nodes[i].appendChild(a);
      }
    }

  }


}
