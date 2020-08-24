from flask import Flask, render_template, url_for, redirect
import re
import random
import html
import os



app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/playground')
def playground():
    return render_template('playground.html')



@app.route('/<string:s>')
def not_found(s):
    return "/" + s + " is not a page on this site."









if __name__ == "__main__":
    app.run(debug=True)
