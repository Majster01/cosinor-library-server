import socketio
import sys
import json
import base64
import tempfile
import csv

sys.path.insert(0,'/home/majster/Documents/diplomska/CosinorPyCustom')

from CosinorPy import file_parser, cosinor, cosinor1
import numpy as np
import pandas as pd
import io

class CommandError(Exception):
  def __init__(self, message):
    super().__init__(message)

def mapToXY(line):
  return [{'x': point[0], 'y': point[1]} for point in line]

def raiseUnsupportedCommandError(csv = None):
  raise CommandError('Unsupported command')

def getCosinorFunction(command):
  switcher={
    'periodogram': periodogram,
    'fit_group': fit_group,
  }

  return switcher.get(command, raiseUnsupportedCommandError)

def periodogram(file):

  if file == None:
    df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)
  else:
    df = file_parser.read_csv(file, ',')

  print(df)
  pyplot = cosinor.periodogram_df(df)

  lines = pyplot.gca().get_lines()

  return [mapToXY(line.get_xydata().tolist()) for line in lines]

def pyplotToBase64(plot):
  buf = io.BytesIO()
  plot.savefig(buf, format='png')
  buf.seek(0)

  base64bytes = base64.b64encode(buf.read())
  base64_message = base64bytes.decode('utf-8')

  return base64_message

def fit_group(file):

  if file == None:
    df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)
  else:
    df = file_parser.read_csv(file, ',')

  print(df)
  figure_image_list = []
  cosinor.fit_group(df, n_components = [1,2,3], period=24, figure_image_list=None)

  print(figure_image_list)

def getFile(fileString, sio, namespace):
  sio.emit('print', 'getFile', namespace=namespace)
  s = io.StringIO(fileString)

  sio.emit('print', s.readlines(), namespace=namespace)

  return io.StringIO(fileString)

if __name__ == "__main__":
  fit_group(None)
