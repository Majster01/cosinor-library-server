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

csvFileType = 'text/csv'
xlsxFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

class CommandError(Exception):
  def __init__(self, message):
    super().__init__(message)

def raiseUnsupportedCommandError(csv = None):
  raise CommandError('Unsupported command')

def validateGenerateData(options, sio, namespace):
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

  if 'replicates' not in options:
    replicates = None
  else:
    replicates = options['replicates']

  
  if 'noise' not in options:
    noise = None
  else:
    noise = options['noise']

  return components, period, amplitudes, replicates, noise

def generate_data(payload, sio, namespace):
  sio.emit('print', 'generate_data', namespace=namespace)

  components, period, amplitudes, replicates,noise = validateGenerateData(payload, sio, namespace)

  sio.emit('print', json.dumps(components), namespace=namespace)
  sio.emit('print', json.dumps(period), namespace=namespace)
  sio.emit('print', json.dumps(amplitudes), namespace=namespace)
  sio.emit('print', json.dumps(noise), namespace=namespace)

  df = file_parser.generate_test_data(phase = 0, period = period, n_components = components, name = "test1", noise = noise, replicates = replicates, amplitudes = amplitudes, independent=False)

  sio.emit('print', 'after file parser', namespace=namespace)

  csv_buffer = io.StringIO()
  file_parser.export_csv(df, csv_buffer)

  csv_string = csv_buffer.getvalue()

  sio.emit('print', csv_string, namespace=namespace)

  return csv_string

def validateCosinorAnalysisCommand(payload):
  if 'cosinorType' not in payload:
    raiseUnsupportedCommandError()
  if 'fileType' not in payload:
    raiseUnsupportedCommandError()
  if 'options' not in payload:
    raiseUnsupportedCommandError()

  options = payload['options']
  fileType = payload['fileType']
  cosinorType = payload['cosinorType']

  if 'data' not in options:
    raiseUnsupportedCommandError()

  data = options['data']

  return cosinorType, fileType, options, data


def periodogram(payload, sio, namespace):
  cosinorType, fileType, options, data = validateCosinorAnalysisCommand(payload)

  hasXlsxReplicates = options['hasXlsxReplicates']

  df = getDataFrame(fileType, data, hasXlsxReplicates)

  sio.emit('print', 'periodogram', namespace=namespace)
  
  sio.emit('print', json.dumps(options), namespace=namespace)

  figure_image_list = []
  cosinor.periodogram_df(df, per_type=options['per_type'], logscale=options['logscale'], max_per=options['max_per'], min_per=options['min_per'], figure_image_list=figure_image_list)

  return json.dumps({
    'graphs': figure_image_list,
    'data': None,
  })

def fit_group_independent(payload, sio, namespace):
  cosinorType, fileType, options, data = validateCosinorAnalysisCommand(payload)

  hasXlsxReplicates = options['hasXlsxReplicates']

  sio.emit('print', 'fit_group_independent', namespace=namespace)
  df = getDataFrame(fileType, data, hasXlsxReplicates)

  figure_image_list = []

  period=options['period']

  if cosinorType == 'general cosinor':
    n_components = options['n_components']

    sio.emit('print', 'cosinorType == general cosinor', namespace=namespace)
    plot = True
    if (n_components == [1,2,3]):
      sio.emit('print', 'n_components == [1,2,3]', namespace=namespace)
      plot = False

    result_df = cosinor.fit_group(df, n_components = n_components, period=period, plot=plot, figure_image_list=figure_image_list)

    if (plot == False):
      sio.emit('print', 'before get_best_models', namespace=namespace)
      df_best_models = cosinor.get_best_models(df, df_models = result_df, n_components = [1,2,3])

      sio.emit('print', 'before plot_df_models', namespace=namespace)
      cosinor.plot_df_models(df, df_best_models, plot_residuals=False, figure_image_list=figure_image_list)

      data = df_best_models.to_csv()
    else:
      data = result_df.to_csv()

  elif cosinorType == 'cosinor1':

    sio.emit('print', 'cosinorType == cosinor1', namespace=namespace)
    result_df = cosinor1.fit_group(df, period=options['period'], figure_image_list=figure_image_list)
    sio.emit('print', 'after cosinor1', namespace=namespace)
    data = result_df.to_csv()

  return json.dumps({
    'graphs': figure_image_list,
    'data': data,
  })

def fit_group_population(payload, sio, namespace):
  cosinorType, fileType, options, data = validateCosinorAnalysisCommand(payload)

  hasXlsxReplicates = options['hasXlsxReplicates']

  df = getDataFrame(fileType, data, hasXlsxReplicates)

  figure_image_list = []

  if cosinorType == 'general cosinor':
    sio.emit('print', 'cosinorType == general cosinor', namespace=namespace)

    n_components = options['n_components']

    plot = True
    if (n_components == [1,2,3]):
      sio.emit('print', 'n_components == [1,2,3]', namespace=namespace)
      plot = False

    sio.emit('print', 'before population_fit_group', namespace=namespace)
    result_df = cosinor.population_fit_group(df, n_components = n_components, period=options['period'], plot_measurements = plot, figure_image_list=figure_image_list)
    sio.emit('print', 'after population_fit_group', namespace=namespace)

    if (plot == False):
      df_best_models = cosinor.get_best_models_population(df, df_models = result_df, n_components = [1,2,3])

      sio.emit('print', 'plot_df_models_population', namespace=namespace)
      sio.emit('print', figure_image_list, namespace=namespace)

      cosinor.plot_df_models_population(df, df_best_models, figure_image_list=figure_image_list)

      data = df_best_models.to_csv()
    else:
      data = result_df.to_csv()
  elif cosinorType == 'cosinor1':
    sio.emit('print', 'cosinorType == cosinor1', namespace=namespace)
    result_df = cosinor1.population_fit_group(df, period=options['period'], figure_image_list=figure_image_list)
    sio.emit('print', 'after cosinor1.population_fit_group', namespace=namespace)

    data = result_df.to_csv()


  return json.dumps({
    'graphs': figure_image_list,
    'data': data,
  })

def comparison_independent(payload, sio, namespace):
  sio.emit('print', 'comparison_independent', namespace=namespace)

  cosinorType, fileType, options, data = validateCosinorAnalysisCommand(payload)
  
  hasXlsxReplicates = options['hasXlsxReplicates']

  sio.emit('print', 'comparison_independent', namespace=namespace)
  df = getDataFrame(fileType, data, hasXlsxReplicates)
  sio.emit('print', json.dumps(options), namespace=namespace)

  figure_image_list = []

  period=options['period']
  pairs=options['pairs']

  sio.emit('print', json.dumps(pairs), namespace=namespace)
  sio.emit('print', 'before if', namespace=namespace)
  if cosinorType == 'general cosinor':
    n_components = options['n_components']

    sio.emit('print', 'cosinorType == general cosinor', namespace=namespace)

    df_comp = cosinor.compare_pairs(df, pairs = pairs, n_components = n_components, period=period, figure_image_list=figure_image_list)

    data = df_comp.to_csv()

  elif cosinorType == 'cosinor1':
    df_comp = cosinor1.test_cosinor_pairs(df, pairs = pairs, period=period, figure_image_list=figure_image_list)

    data = df_comp.to_csv()

  return json.dumps({
    'graphs': figure_image_list,
    'data': data,
  })

def comparison_population(payload, sio, namespace):
  sio.emit('print', 'comparison_population validateCosinorAnalysisCommand', namespace=namespace)

  cosinorType, fileType, options, data = validateCosinorAnalysisCommand(payload)
  
  sio.emit('print', fileType, namespace=namespace)

  hasXlsxReplicates = options['hasXlsxReplicates']

  sio.emit('print', hasXlsxReplicates, namespace=namespace)
  df = getDataFrame(fileType, data, hasXlsxReplicates)
  sio.emit('print', json.dumps(options), namespace=namespace)

  figure_image_list = []

  period=options['period']
  pairs=options['pairs']

  df_comp = cosinor1.population_test_cosinor_pairs(df, pairs = pairs, period=period, plot_on=True, figure_image_list = figure_image_list)

  data = df_comp.to_csv()

  return json.dumps({
    'graphs': figure_image_list,
    'data': data,
  })

def getDataFrame(fileType, fileString, hasXLSXReplicates):

  if fileType == csvFileType:
    file = io.StringIO(fileString)

    return file_parser.read_csv(file, '\t')
  elif fileType == xlsxFileType:

    base64_bytes = fileString.encode('ascii')
    message_bytes = base64.b64decode(base64_bytes)
    file = io.BytesIO(message_bytes)
    
    if (hasXLSXReplicates == True): 
      return file_parser.read_excel(file, independent=False)
    

    return file_parser.read_excel(file)


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

  @sio.on('generate_data', namespace=namespace)
  def on_generate_data(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = generate_data(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

  @sio.on('periodogram', namespace=namespace)
  def on_periodogram(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = periodogram(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

  @sio.on('fit_group_independent', namespace=namespace)
  def on_fit_group_independent(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = fit_group_independent(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

  @sio.on('fit_group_population', namespace=namespace)
  def on_fit_group_population(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = fit_group_population(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

  @sio.on('comparison_independent', namespace=namespace)
  def on_comparison_independent(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = comparison_independent(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

  @sio.on('comparison_population', namespace=namespace)
  def on_comparison_population(data):
    sio.emit('loading',  namespace=namespace)

    try:
      response = comparison_population(data, sio, namespace)

      sio.emit('response', response, namespace=namespace)
      sys.exit()
    except:
      sio.emit('error', 'Unknown error', namespace=namespace)
      sys.exit()

    
  sio.connect('http://localhost:5000', namespaces=[namespace])

def main():
  createSocket(sys.argv[1])

if __name__ == "__main__":
  main()
