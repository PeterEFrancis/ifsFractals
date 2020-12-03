from flask import Flask, render_template, url_for, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_heroku import Heroku
import re
import random as r
import html
import os
import time


app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/ifs-fractals'
heroku = Heroku(app)






 #      _       _        _
 #   __| | __ _| |_ __ _| |__   __ _ ___  ___
 #  / _` |/ _` | __/ _` | '_ \ / _` / __|/ _ \
 # | (_| | (_| | || (_| | |_) | (_| \__ \  __/
 #  \__,_|\__,_|\__\__,_|_.__/ \__,_|___/\___|
 #

db = SQLAlchemy(app)

class Playground(db.Model):
    __tablename__ = "playgrounds"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    title = db.Column(db.Text)
    transformations = db.Column(db.Text)
    weights = db.Column(db.Text)
    vars = db.Column(db.Text)
    zoom = db.Column(db.Text)
    center = db.Column(db.Text)
    points = db.Column(db.Text)
    color = db.Column(db.Text)

    def __init__(self, name, title, transformations, weights, vars, zoom, center, points, color):
        self.name = name
        self.title = title
        self.transformations = transformations
        self.weights = weights
        self.vars = vars
        self.zoom = zoom
        self.center = center
        self.points = points
        self.color = color

    def to_json(self):
        return jsonify({
            "name": self.name,
            "title": self.title,
            "transformations": self.transformations,
            "weights": self.weights,
            "vars": self.vars,
            "zoom": self.zoom,
            "center": self.center,
            "points": self.points,
            "color": self.color
        })


def is_a_playground_name(name):
    return len(list(db.session.query(Playground).filter(Playground.name == name))) != 0


def get_new_name():
    return hex(int(time.time()*1000000))[2:]



def save(title, transformations, weights, vars, zoom, center, points, color):
    name = get_new_name()
    playground = Playground(
        name = name,
        title = title,
        transformations = transformations,
        weights = weights,
        vars = vars,
        zoom = zoom,
        center = center,
        points = points,
        color = color
    )
    db.session.add(playground)
    db.session.commit()
    return name



@app.route('/save_playground', methods=['POST'])
def save_playground():
    if request.method == 'POST':
        title = request.form['title']
        transformations = request.form['transformations']
        weights = request.form['weights']
        vars = request.form['vars']
        zoom = request.form['zoom']
        center = request.form['center']
        points = request.form['points']
        color = request.form['color']
        name = save(title, transformations, weights, vars, zoom, center, points, color)
        return jsonify({'success':'true', 'name':name})
    return 'Access Denied'




@app.route('/db/<string:name>', methods=['POST'])
def database(name):
    if request.method == 'POST':
        if is_a_playground_name(name):
            return db.session.query(Playground).filter(Playground.name == name)[0].to_json()
        return ""
    return 'Access Denied'



def drop_and_create():
    db.drop_all()
    db.create_all()


def delete_playground(name):
    db.session.query(Playground).filter(Playground.name == name).delete()
    db.session.commit()



@app.route('/initialize_examples')
def initialize_examples():
    directory = 'static/examples/'
    for filename in os.listdir(directory):
        delete_playground(filename)
        with open(os.path.join(directory, filename)) as f:
            info = eval(f.read().replace('\n','').replace(' ',''))
            db.session.add(
                Playground(
                    name = filename,
                    title = info['title'],
                    transformations = info['transformations'],
                    weights = info['weights'],
                    vars = info['vars'],
                    zoom = info['zoom'],
                    center = info['center'],
                    points = info['points'],
                    color = info['color']
                )
            )
            db.session.commit()
    return 'done'





 #  _ __   __ _  __ _  ___    __ _  ___ ___ ___  ___ ___
 # | '_ \ / _` |/ _` |/ _ \  / _` |/ __/ __/ _ \/ __/ __|
 # | |_) | (_| | (_| |  __/ | (_| | (_| (_|  __/\__ \__ \
 # | .__/ \__,_|\__, |\___|  \__,_|\___\___\___||___/___/
 # |_|          |___/


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/math')
def math():
    return render_template('math.html')



examples = ['barnsley', 'serpinski', 'vonkoch', 'dragon', 'crab', 'tree']


@app.route('/playground')
@app.route('/playground/')
def playground():
    return redirect('/playground/barnsley') # + random.choice(examples))


@app.route('/playground/<string:s>')
def playground_saved(s):
    if is_a_playground_name(s):
        playground = db.session.query(Playground).filter(Playground.name == s)[0]
        return render_template('playground.html', playground=playground)
    else:
        return "no playground found"


@app.route('/word-fractals')
def word_fractals():
    return render_template('word-fractals.html', word='Fractal')


@app.route('/word-fractals/<string:word>')
def word_fractals_specific(word):
    return render_template('word-fractals.html', word=word)




@app.route('/saved')
def saved():
    return render_template('saved.html', all=db.session.query(Playground))



@app.route('/playground/t=<string:transformations>/w=<string:weights>')
def m(transformations, weights):
    name = save('myImportedFractal', transformations, weights, "{}", "auto", '{"x":0,"y":0}', "10000", "#000000")
    return redirect('/playground/' + name)


@app.route('/random/<int:num>')
def random(num):
    # create transformations
    transformations = ''
    vars = '{'
    for i in range(num):
        b = round(r.random(),2)
        c = 0
        while c == 0:
            c = round(r.random(),2)
        f = ((1 - c**2) * (1 - b**2) / (c**2))**(1/2)
        a = round((r.random() - 0.5) * 2 * f, 3)
        while a**2 * c**2 >= (1 - b**2) * (1 - c**2):
            a -= 0.01 * (1 if a > 0 else -1)
        theta = round(6.283185307179586 * r.random(),2)
        h = round(r.random(),2)
        k = round(r.random(),2)
        v = [a, b, c, theta, h, k]
        if i < 26:
            letter = 'abcdefghijklmnopqrstuvwxyz'[i]
            replaced = r.randint(0,5)
            replaced_val = v[replaced]
            v[replaced] = letter
            vars += '"' + letter + '":{"val":' + str(replaced_val) + ',"min":-1,"max":1,"step":0.1},'
        t = f'Translate({v[4]},{v[5]})'
        t += f'Rotate({v[3]})'
        t += f'XShear({v[0]})'
        t += f'XYScale({v[1]},{v[2]})'
        transformations += t
        if i < num - 1:
            transformations += '&'
    vars = vars[:-1] + "}"

    playground = Playground(
        name = get_new_name(),
        title='',
        transformations=transformations,
        weights=','.join('1' for _ in range(num)),
        vars=vars,
        zoom='auto',
        center='{"x":0,"y":0}',
        points="10000",
        color="#000000"
    )
    return render_template('playground.html', playground=playground)





@app.route('/test')
def test():
    return render_template('test.html')



 #            _           _
 #   __ _  __| |_ __ ___ (_)_ __
 #  / _` |/ _` | '_ ` _ \| | '_ \
 # | (_| | (_| | | | | | | | | | |
 #  \__,_|\__,_|_| |_| |_|_|_| |_|


# @app.route('/admin')
# def admin():
#     return render_template('admin.html')




@app.route('/delete', methods=['POST'])
def delete():
    if request.method == 'POST':
        if request.form['password'] == 'ILoveFractals':
            names = request.form['names'].split(',')
            for name in names:
                delete_playground(name)
            return jsonify({"success":"true"})
        else:
            return jsonify({"success":"false", "error":"incorrect password"})
    else:
        return 'Access Denied'



 #   __ _ _ __  _ __    _ __ _   _ _ __
 #  / _` | '_ \| '_ \  | '__| | | | '_ \
 # | (_| | |_) | |_) | | |  | |_| | | | |
 #  \__,_| .__/| .__/  |_|   \__,_|_| |_|
 #       |_|   |_|


if __name__ == "__main__":
    app.run(debug=True)
