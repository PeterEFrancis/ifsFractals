from flask import Flask, render_template, url_for, redirect
import re
import random
import html
import os



app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')
