import socketio
import sys

from CosinorPy import file_parser, cosinor, cosinor1
import numpy as np
import pandas as pd

sio = socketio.Client(
  logger=True,
  reconnection_attempts=5,
  binary=True
)

namespace = '/python-library'

def mapToXY(line):
  return [{'x': point[0], 'y': point[1]} for point in line]

@sio.event
def connect_error():
  print("The connection failed!")

@sio.event
def disconnect():
  print("I'm disconnected!")
  sys.exit()


def fit_group(file, sio, namespace):

  sio.emit('print', 'periodogram', namespace=namespace)
  sio.emit('print', file == None, namespace=namespace)
  if file == None:
    df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)
  else:
    df = file_parser.read_csv(file, ',')

  sio.emit('print', 'df', namespace=namespace)
  print(df)
  pyplot = cosinor.fit_group(df, return_data=True)
  sio.emit('print', 'pyplot', namespace=namespace)

  lines = pyplot.gca().get_lines()

  return [mapToXY(line.get_xydata().tolist()) for line in lines]

@sio.on('run', namespace=namespace)
def on_message(data):
  print(data)
  sio.emit('response', 'Python spaws is connected', namespace=namespace)

  print('On event run ' + data)
  sio.emit('loading',  namespace=namespace)

  df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 3)
  
  data = cosinor.periodogram_df(df)
  print('data')
  print(data)

  sio.emit('response', 'test', namespace=namespace)
  sys.exit()

@sio.event(namespace=namespace)
def connect():
  print("I'm connected to the /python-library namespace!")

sio.connect('http://localhost:5000', namespaces=[namespace])
print("after connect" + namespace)

sio.emit('message', 'Python spaws is connected', namespace=namespace)
print("after emit" + namespace)

