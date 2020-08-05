import socketio
import sys

from CosinorPy import file_parser, cosinor, cosinor1
import numpy as np
import pandas as pd
import io

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


class CommandError(Exception):
  def __init__(self, message):
    super().__init__(message)

def raiseUnsupportedCommandError(csv = None):
  raise CommandError('Unsupported command')

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


def validateGenerateData(payload):
  if 'command' not in payload:
    raiseUnsupportedCommandError()
  if 'options' not in payload:
    raiseUnsupportedCommandError()

  options = payload['options']

  if 'components' not in options:
    components = None
  else:
    components = options['components']

  
  if 'period' not in options:
    period = None
  else:
    period = options['period']

  
  if 'amplitudes' not in options:
    amplitudes = None
  else:
    amplitudes = options['amplitudes']

  
  if 'noise' not in options:
    noise = None
  else:
    noise = options['noise']

  return components, period, amplitudes, noise

def generate_data(payload, sio, namespace):
  sio.emit('print', 'generate_data', namespace=namespace)

  components, period, amplitudes, noise = validateGenerateData(payload)

  df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)

  sio.emit('print', 'after file parser', namespace=namespace)

  buffer = io.BytesIO()
  df.to_csv(buffer, sep="\t")

  sio.emit('print', 'buffer', namespace=namespace)
  sio.emit('print', buffer, namespace=namespace)

  return df

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

