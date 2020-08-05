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

def getCommandFunction(command):
  switcher={
    'periodogram': periodogram,
    'fit_group': fit_group,
    'generate_data': generate_data,
  }

  return switcher.get(command, raiseUnsupportedCommandError)

def pyplotToBase64(plot):
  buf = io.BytesIO()
  plot.savefig(buf, format='png')
  buf.seek(0)

  base64bytes = base64.b64encode(buf.read())
  base64_message = base64bytes.decode('utf-8')

  return base64_message

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

  sio.emit('print', json.dumps(components), namespace=namespace)
  sio.emit('print', json.dumps(period), namespace=namespace)
  sio.emit('print', json.dumps(amplitudes), namespace=namespace)
  sio.emit('print', json.dumps(noise), namespace=namespace)

  df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)

  sio.emit('print', 'after file parser', namespace=namespace)

  csv_buffer = io.StringIO()
  df.to_csv(csv_buffer, sep="\t", index=False, na_rep='NA')

  csv_string = csv_buffer.getvalue()

  sio.emit('print', csv_string, namespace=namespace)

  return csv_string

def validateCosinorAnalysisCommand(payload):
  if 'command' not in payload:
    raiseUnsupportedCommandError()
  if 'cosinorType' not in payload:
    raiseUnsupportedCommandError()
  if 'options' not in payload:
    raiseUnsupportedCommandError()

  options = payload['options']
  cosinorType = payload['cosinorType']

  if 'data' not in options:
    raiseUnsupportedCommandError()

  data = options['data']

  return cosinorType, options, data
  

def periodogram(payload, sio, namespace):
  cosinorType, options, data = validateCosinorAnalysisCommand(payload)

  file = getFile(data, sio, namespace)

  sio.emit('print', 'periodogram', namespace=namespace)
  sio.emit('print', file == None, namespace=namespace)
  
  df = file_parser.read_csv(file, '\t')

  sio.emit('print', 'df', namespace=namespace)

  figure_image_list = []
  cosinor.periodogram_df(df, per_type=options['per_type'], logscale=options['logscale'], prominent=options['prominent'], max_per=options['max_per'], figure_image_list=figure_image_list)

  return json.dumps(figure_image_list)

def fit_group(payload, sio, namespace):
  cosinorType, options, data = validateCosinorAnalysisCommand(payload)

  file = getFile(data, sio, namespace)

  sio.emit('print', 'fit_group', namespace=namespace)
  sio.emit('print', file == None, namespace=namespace)
  
  df = pd.read_csv(file, '\t')

  sio.emit('print', 'df', namespace=namespace)
  print(df)
  figure_image_list = []

  if cosinorType == 'general cosinor':
    cosinor.fit_group(df, n_components = options['n_components'], period=options['period'], figure_image_list=figure_image_list)
    sio.emit('print', 'general cosinor', namespace=namespace)
  elif cosinorType == 'cosinor1':
    sio.emit('print', 'cosinor1', namespace=namespace)
    cosinor1.fit_group(df, period=options['period'], figure_image_list=figure_image_list)

  return json.dumps(figure_image_list)

def getFile(fileString, sio, namespace):
  sio.emit('print', 'getFile', namespace=namespace)

  sio.emit('print', fileString, namespace=namespace)

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
      commandFunction = getCommandFunction(data['command'])

      response = commandFunction(data, sio, namespace)

      sio.emit('print', 'before response', namespace=namespace)
      sio.emit('print', response, namespace=namespace)

      sio.emit('response', response, namespace=namespace)
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
