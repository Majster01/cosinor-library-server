import sys
import json

sys.path.insert(0,'/home/majster/Documents/diplomska/CosinorPyCustom')

print(sys.path)

from CosinorPy import file_parser, cosinor, cosinor1
import numpy as np
import pandas as pd

class CommandError(Exception):
  def __init__(self, message):
    super().__init__(message)

def unsupportedCommandError():
  raise CommandError('Unsupported command')

def mapToXY(line):
  return [{'x': point[0], 'y': point[1]} for point in line]

def getCosinorFunction(command):
  switcher={
    'periodogram': periodogram,
  }

  print(switcher.get(command, 'not found'))

  return switcher.get(command, 'not found')

def periodogram(csv = None):
  df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 1)

  pyplot = cosinor.periodogram_df(df)

  lines = pyplot.gca().get_lines()

  data = lines[0].get_xydata()

  return [mapToXY(line.get_xydata().tolist()) for line in lines]

# df = file_parser.generate_test_data(phase = 0, n_components = 1, name="test1", noise=0.5, replicates = 3)
# print('data')
# print(df)
# # print(type(df))
# # print(df.to_json(
# #   orient='records'
# # ))

# pyplot = cosinor.periodogram_df(df)

# lines = pyplot.gca().get_lines()

# data = lines[0].get_xydata()

# linesData = [mapToXY(line.get_xydata().tolist()) for line in lines]

# print('pyplot data')
# print(data)
# print(json.dumps(data.tolist()))
# print(json.dumps(linesData))

# json_string = json.dumps(data)

# print(json_string)

data = {
  'command': 'periodogram'
}

if 'command' not in data:
  unsupportedCommandError()

print(data['command'])

cosinorFunction = getCosinorFunction(data['command'])

print('cosinorFunction')
print(cosinorFunction)

if 'csv' in data:
  linesData = cosinorFunction(data['csv'])
else:
  linesData = cosinorFunction()

print(linesData)