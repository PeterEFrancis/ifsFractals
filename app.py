from flask import Flask, render_template, url_for, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_heroku import Heroku
import re
import random
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
    return render_template('word-fractals.html')


@app.route('/saved')
def saved():
    return render_template('saved.html', all=db.session.query(Playground))



@app.route('/playground/t=<string:transformations>/w=<string:weights>')
def m(transformations, weights):
    name = save('myImportedFractal', transformations, weights, "{}", "auto", '{"x":0,"y":0}', "10000", "#000000")
    return redirect('/playground/' + name)








 #  _       _ _   _       _ _
 # (_)_ __ (_) |_(_) __ _| (_)_______
 # | | '_ \| | __| |/ _` | | |_  / _ \
 # | | | | | | |_| | (_| | | |/ /  __/
 # |_|_| |_|_|\__|_|\__,_|_|_/___\___|


# @app.route('/initialize')
def initialize():
    db.drop_all()
    db.create_all()
    directory = 'static/examples/'
    for filename in os.listdir(directory):
        with open(os.path.join(directory, filename)) as f:
            info = eval(f.read().replace('\n','').replace(' ',''))
            playground = Playground(
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
            db.session.add(playground)
            db.session.commit()
    return 'done'


 #   __ _ _ __  _ __    _ __ _   _ _ __
 #  / _` | '_ \| '_ \  | '__| | | | '_ \
 # | (_| | |_) | |_) | | |  | |_| | | | |
 #  \__,_| .__/| .__/  |_|   \__,_|_| |_|
 #       |_|   |_|


if __name__ == "__main__":
    app.run(debug=True)
