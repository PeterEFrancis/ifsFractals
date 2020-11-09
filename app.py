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
    info = db.Column(db.Text)

    def __init__(self, name, info):
        self.name = name
        self.info = info



def is_a_playground_name(name):
    return len(list(db.session.query(Playground).filter(Playground.name == name))) != 0


def get_new_name():
    return hex(int(time.time()*1000000))[2:]




@app.route('/save_playground', methods=['POST'])
def save_playground():
    if request.method == 'POST':
        name = get_new_name()
        playground = Playground(name = name, info = request.form['info'])
        db.session.add(playground)
        db.session.commit()
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


examples = ['barnsley', 'serpinski', 'vonkoch', 'dragon', 'crab', 'tree']


@app.route('/playground')
@app.route('/playground/')
def playground():
    return redirect('/playground/' + random.choice(examples))


@app.route('/playground/<string:s>')
def playground_saved(s):
    if is_a_playground_name(s):
        info = db.session.query(Playground).filter(Playground.name == s)[0].info
        return render_template('playground.html', info=info)
    else:
        return "no playground found"


@app.route('/word-fractals')
def word_fractals():
    return render_template('word-fractals.html')


@app.route('/master')
def master():
    return render_template('master.html', all=db.session.query(Playground))





 #  _       _ _   _       _ _
 # (_)_ __ (_) |_(_) __ _| (_)_______
 # | | '_ \| | __| |/ _` | | |_  / _ \
 # | | | | | | |_| | (_| | | |/ /  __/
 # |_|_| |_|_|\__|_|\__,_|_|_/___\___|


@app.route('/initialize')
def initialize():
    db.create_all()
    directory = 'static/examples/'
    for filename in os.listdir(directory):
        with open(os.path.join(directory, filename)) as f:
            playground = Playground(name=filename, info=f.read().strip())
            db.session.add(playground)
            db.session.commit()



 #   __ _ _ __  _ __    _ __ _   _ _ __
 #  / _` | '_ \| '_ \  | '__| | | | '_ \
 # | (_| | |_) | |_) | | |  | |_| | | | |
 #  \__,_| .__/| .__/  |_|   \__,_|_| |_|
 #       |_|   |_|


if __name__ == "__main__":
    app.run(debug=True)
