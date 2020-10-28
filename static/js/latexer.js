const labeled_blocks_tag_types = [
  'DEFINITION',
  'THEOREM',
  'LEMMA',
];

var test;

class LaTeXer {

  constructor(container) {
    this.container = container;
  }

  render() {
    var nodes = this.container.childNodes;

    var refs = {};
    var section_tree = {};

    // labeled blocks nodes
    var block_number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (labeled_blocks_tag_types.includes(nodes[i].tagName)) {
        var id = nodes[i].id || nodes[i].tagName.toLowerCase() + '-' + block_number;
        var blockquote = document.createElement('blockquote');
        var strong = document.createElement('strong');
        var text = document.createElement('p');
        strong.appendChild(
          document.createTextNode(
            nodes[i].tagName.charAt(0).toUpperCase() + nodes[i].tagName.slice(1).toLowerCase() + " "
          )
        );
        var a = document.createElement('a');
        a.appendChild(document.createTextNode(block_number));
        a.href = "#" + id;
        strong.appendChild(a);
        strong.appendChild(document.createTextNode('.'));
        if (nodes[i].title) {
          strong.appendChild(document.createTextNode(' ' + nodes[i].title + '.'))
        }
        text.innerHTML = nodes[i].innerHTML;
        blockquote.appendChild(strong);
        blockquote.appendChild(text);
        blockquote.id = id;
        this.container.replaceChild(blockquote, nodes[i]);

        refs[id] = block_number;
        block_number++;
      }
    }

    // tables
    var table_number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLE") {
        var id = nodes[i].id || 'table-' + table_number;
        var caption_text = nodes[i].getAttribute('caption');
        nodes[i].classList.add('table');
        nodes[i].id = undefined;
        var table_container = document.createElement('div');
        table_container.classList.add('table-container');
        table_container.appendChild(nodes[i]);
        if (caption_text) {
          var caption = document.createElement('p');
          caption.classList.add('text-center');
          var a = document.createElement('a');
          a.appendChild(document.createTextNode(table_number));
          a.href = "#" + id;
          caption.appendChild(document.createTextNode('Table '));
          caption.appendChild(a);
          caption.appendChild(document.createTextNode(': ' + caption_text));
          table_container.appendChild(caption);
        }
        table_container.id = id;
        this.container.replaceChild(table_container, nodes[i]);
        refs[id] = table_number;
        table_number++;
      }
    }


    // sections and subsections
    var section_number = 0;
    var subsection_number = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "SECTION") {
        section_number++;
        var text = nodes[i].innerHTML;
        var id = nodes[i].id || "section-" + section_number;
        var h3 = document.createElement('h3');
        h3.classList.add('section');
        h3.id = id;
        var a = document.createElement('a');
        a.appendChild(document.createTextNode(section_number));
        a.href = "#" + id;
        h3.appendChild(a);
        h3.appendChild(document.createTextNode(" " + text));
        this.container.replaceChild(h3, nodes[i]);
        subsection_number = 0;
        refs[id] = section_number;
        section_tree[section_number] = {
          text: text,
          id: id,
          subsections: {}
        };
      } else if (nodes[i].tagName == "SUBSECTION") {
        subsection_number++;
        var text = nodes[i].innerHTML;
        var id = nodes[i].id || "subsection-" + section_number + "." + section_number;
        var h4 = document.createElement('h4');
        h4.classList.add('subsection');
        h4.id = id;
        h4.appendChild(document.createTextNode(section_number + "." + subsection_number + "  " + text));
        this.container.replaceChild(h4, nodes[i]);
        refs[id] = section_number + "." + subsection_number;
        section_tree[section_number].subsections[subsection_number] = {
          text: text,
          id: id
        };
      }
    }

    // build references
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "REF") {
        var a = document.createElement('a');
        var to = nodes[i].getAttribute('to');
        a.href = "#" + to;
        a.innerHTML = refs[to];
        nodes[i].appendChild(a);
      }
    }

    // build table of contents
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLEOFCONTENTS") {
        var div = document.createElement('div');
        div.classList.add('LaTeX-toc')
        var heading = document.createElement('h3');
        heading.appendChild(document.createTextNode('Contents'));
        div.appendChild(heading);
        var ol = document.createElement('ol');
        for (var s in section_tree) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.innerHTML = section_tree[s].text;
          a.href = "#" + section_tree[s].id;
          li.appendChild(a);
          if (section_tree[s].subsections[1]) {
            var sub_ol = document.createElement('ol');
            for (var sub in section_tree[s].subsections) {
              var sub_li = document.createElement('li');
              var a = document.createElement('a');
              a.innerHTML = section_tree[s].subsections[sub].text;
              a.href = "#" + section_tree[s].subsections[sub].id;
              sub_li.appendChild(a);
              sub_ol.appendChild(sub_li);
            }
            li.appendChild(sub_ol);
          }
          ol.appendChild(li);
          div.appendChild(ol);
        }
        this.container.replaceChild(div, nodes[i]);
      }
    }


    // apply style
    this.container.classList.add('LaTeX');

  }


}
