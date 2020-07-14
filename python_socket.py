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
import matplotlib

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

def pyplotToBase64(plot):
  buf = io.BytesIO()
  plot.savefig(buf, format='png')
  buf.seek(0)

  base64bytes = base64.b64encode(buf.read())
  base64_message = base64bytes.decode('utf-8')

  return base64_message

def periodogram(options, file, sio, namespace):

  sio.emit('print', 'periodogram', namespace=namespace)
  sio.emit('print', file == None, namespace=namespace)
  if file == None:
    df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)
  else:
    df = file_parser.read_csv(file, ',')

  sio.emit('print', 'df', namespace=namespace)
  print(df)

  figure_image_list = []
  cosinor.periodogram_df(df, per_type=options['per_type'], logscale=options['logscale'], prominent=options['prominent'], max_per=options['max_per'], figure_image_list=figure_image_list)

  return figure_image_list

def fit_group(options, file, sio, namespace):

  sio.emit('print', 'fit_group', namespace=namespace)
  sio.emit('print', file == None, namespace=namespace)
  if file == None:
    df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)
  else:
    df = file_parser.read_csv(file, ',')

  sio.emit('print', 'df', namespace=namespace)
  print(df)
  figure_image_list = []
  cosinor.fit_group(df, n_components = options['n_components'], period=options['period'], figure_image_list=figure_image_list)
  sio.emit('print', 'pyplot', namespace=namespace)

  return figure_image_list

def getFile(fileString, sio, namespace):
  sio.emit('print', 'getFile', namespace=namespace)
  s = io.StringIO(fileString)

  sio.emit('print', s.readlines(), namespace=namespace)

  return io.StringIO(fileString)

def createSocket(uuid):
  sio = socketio.Client()

  namespace = '/python-library/' + uuid

  @sio.event
  def connect_error():
    print("The connection failed!")

  @sio.event
  def disconnect():
    print("I'm disconnected!")
    sys.exit()

  @sio.on('run', namespace=namespace)
  def on_message(data):
    print('On event run ')
    sio.emit('loading',  namespace=namespace)

    sio.emit('print', json.dumps(data), namespace=namespace)

    try:
      if 'command' not in data:
        raiseUnsupportedCommandError()
      if 'options' not in data:
        raiseUnsupportedCommandError()

      cosinorFunction = getCosinorFunction(data['command'])

      options = data['options']

      if 'file' in data:
        sio.emit('print', data['file'], namespace=namespace)
        file = getFile(data['file'], sio, namespace)
        linesData = cosinorFunction(options, file, sio, namespace)
      else:
        linesData = cosinorFunction(options, None, sio, namespace)

      sio.emit('response', json.dumps(linesData), namespace=namespace)
      sys.exit()
    except CommandError:
      sio.emit('error', 'Unsupported command' ,namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()
    

  sio.connect('http://localhost:5000', namespaces=[namespace])
  print('after connect')

def main():
  createSocket(sys.argv[1])

if __name__ == "__main__":
  main()
